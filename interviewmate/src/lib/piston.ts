/**
 * Real Code Execution Sandbox API via Piston Engine
 * Supports Python, JavaScript, TypeScript, C++, Java, Go, C.
 *
 * Key design:
 *   1.  wrapCodeWithTestHarness() injects a Python (or JS) test-driver
 *       that actually CALLS the user's function/class, captures output,
 *       and prints "RESULT:<json>" per test case.
 *   2.  executeCodeInSandbox() sends the wrapped code to the Piston API,
 *       parses stdout lines, and compares actual vs expected output.
 *   3.  If all Piston endpoints fail (401 / timeout), the fallback now
 *       honestly reports a system_error instead of faking passes.
 */

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isSample?: boolean;
}

export interface TestExecutionCaseResult {
  caseId: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
}

export interface CodeExecutionResult {
  status: "success" | "compile_error" | "runtime_error" | "system_error";
  compileError?: {
    rawError: string;
    line?: number;
    column?: number;
  };
  runtimeError?: string;
  systemError?: string;
  results?: TestExecutionCaseResult[];
  passCount?: number;
  totalCount?: number;
  stdout?: string;
}

const JUDGE0_ENDPOINT = "https://ce.judge0.com/submissions?wait=true";

/** Judge0 CE language IDs — see https://ce.judge0.com/languages */
const JUDGE0_LANGUAGE_MAP: Record<string, { languageId: number; pistonLang: string }> = {
  python:     { languageId: 71, pistonLang: "python" },
  python3:    { languageId: 71, pistonLang: "python" },
  javascript: { languageId: 63, pistonLang: "javascript" },
  js:         { languageId: 63, pistonLang: "javascript" },
  typescript: { languageId: 74, pistonLang: "typescript" },
  ts:         { languageId: 74, pistonLang: "typescript" },
  java:       { languageId: 62, pistonLang: "java" },
  cpp:        { languageId: 54, pistonLang: "c++" },
  "c++":      { languageId: 54, pistonLang: "c++" },
  c:          { languageId: 50, pistonLang: "c" },
  go:         { languageId: 60, pistonLang: "go" },
  golang:     { languageId: 60, pistonLang: "go" },
};

// ---------------------------------------------------------------------------
// Error location extraction (unchanged)
// ---------------------------------------------------------------------------

function extractErrorLocation(stderr: string, language: string): { line?: number; column?: number } {
  if (!stderr) return {};

  const cppMatch = stderr.match(/(?:main|solution|source|\.cpp|\.c|\.java):(\d+):(\d+):/i);
  if (cppMatch) {
    return { line: parseInt(cppMatch[1], 10), column: parseInt(cppMatch[2], 10) };
  }

  const pyMatch = stderr.match(/line (\d+)/i);
  if (pyMatch) {
    return { line: parseInt(pyMatch[1], 10) };
  }

  const javaMatch = stderr.match(/(\d+): error:/i);
  if (javaMatch) {
    return { line: parseInt(javaMatch[1], 10) };
  }

  const jsMatch = stderr.match(/(?:line|Line)\s+(\d+)(?:,\s*col(?:umn)?\s*(\d+)|:\s*(?:char|Char)?\s*(\d+))?/i);
  if (jsMatch) {
    return {
      line: parseInt(jsMatch[1], 10),
      column: jsMatch[2] || jsMatch[3] ? parseInt(jsMatch[2] || jsMatch[3], 10) : undefined,
    };
  }

  return {};
}

function formatLeetCodeCompileError(rawStderr: string, language: string, line?: number, col?: number): string {
  if (!rawStderr) return "Compile Error: Syntax error in code.";
  const lang = (language || "").toLowerCase();
  const cleanStderr = rawStderr.trim();

  if (cleanStderr.startsWith("Line ") && cleanStderr.includes("Char ")) {
    return cleanStderr;
  }

  const errLine = line || 1;
  const errCol = col || 1;

  if (lang.includes("cpp") || lang.includes("c++") || lang === "c") {
    return `Line ${errLine}: Char ${errCol}: error: compilation failed [-Werror]\n${cleanStderr}\n1 error generated.`;
  }

  if (lang.includes("java")) {
    return `Line ${errLine}: error: compilation failed\n${cleanStderr}\n1 error generated.`;
  }

  if (lang.includes("python")) {
    return `Line ${errLine}: SyntaxError\n${cleanStderr}`;
  }

  return `Line ${errLine}: Char ${errCol}: error:\n${cleanStderr}`;
}

// ---------------------------------------------------------------------------
//  Detect whether the user code defines a class or a standalone function
// ---------------------------------------------------------------------------

function detectCodeStructure(userCode: string): {
  type: "class" | "function" | "unknown";
  name: string;
  funcName?: string;            // for function problems
  /** function parameter names, in order */
  params?: string[];
} {
  // Check for class first (class MyClass:)
  const classMatch = userCode.match(/^class\s+(\w+)/m);
  if (classMatch) {
    return { type: "class", name: classMatch[1] };
  }

  // Check for function (def myFunc(...):)
  const funcMatch = userCode.match(/^def\s+(\w+)\s*\(([^)]*)\)/m);
  if (funcMatch) {
    const funcName = funcMatch[1];
    const rawParams = funcMatch[2];
    // Parse parameter names, stripping type hints and defaults
    const params = rawParams
      .split(",")
      .map((p) => p.trim().split(":")[0].split("=")[0].trim())
      .filter((p) => p.length > 0);
    return { type: "function", name: funcName, funcName, params };
  }

  return { type: "unknown", name: "" };
}

// ---------------------------------------------------------------------------
//  Check if a problem uses a linked list (needs helper code)
// ---------------------------------------------------------------------------

function needsLinkedListHelper(userCode: string, testCases: TestCase[]): boolean {
  const hasListNode = /ListNode/i.test(userCode);
  const inputHasHead = testCases.some((tc) => tc.input.trim().startsWith("head"));
  return hasListNode || inputHasHead;
}

// ---------------------------------------------------------------------------
//  Generate PYTHON test harness
// ---------------------------------------------------------------------------

function buildPythonTestHarness(userCode: string, testCases: TestCase[]): string {
  const structure = detectCodeStructure(userCode);
  const usesLinkedList = needsLinkedListHelper(userCode, testCases);

  // Embedded test-case data (as a Python list of dicts)
  const testDataPy = JSON.stringify(
    testCases.map((tc) => ({ input: tc.input, expected: tc.expectedOutput }))
  );

  // ── Linked-list helpers ──
  const linkedListHelpers = usesLinkedList
    ? `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def _build_linked_list(arr):
    if not arr:
        return None
    head = ListNode(arr[0])
    curr = head
    for v in arr[1:]:
        curr.next = ListNode(v)
        curr = curr.next
    return head

def _linked_list_to_list(node):
    result = []
    while node:
        result.append(node.val)
        node = node.next
    return result
`
    : "";

  // ── Argument parser ──
  // Parses strings like:  nums = [2,7,11,15], target = 9
  // into a dict:           {"nums": [2,7,11,15], "target": 9}
  const argParserPy = `
import json, re, sys

def _parse_function_args(input_str):
    """Parse 'var1 = val1, var2 = val2' into an ordered list of (name, value) tuples."""
    # Split on boundaries: ', identifier =' but not commas inside brackets/strings
    parts = re.split(r',\\s*(?=[a-zA-Z_]\\w*\\s*=)', input_str)
    result = []
    for part in parts:
        part = part.strip()
        eq_idx = part.find('=')
        if eq_idx == -1:
            continue
        key = part[:eq_idx].strip()
        val_str = part[eq_idx+1:].strip()
        try:
            val = eval(val_str)
        except Exception:
            val = val_str
        result.append((key, val))
    return result

def _normalize_output(val):
    """Convert a Python value to a string matching the expected-output format."""
    if val is None:
        return "null"
    if isinstance(val, bool):
        return "true" if val else "false"
    if isinstance(val, list):
        return json.dumps(val, separators=(', ', ': '))  # readable format like [1, 2]
    return str(val)

def _normalize_for_compare(s):
    """Normalize a string for loose comparison: strip whitespace, lowercase booleans, etc."""
    s = s.strip()
    # Normalize JSON-style spacing
    try:
        parsed = json.loads(s)
        return json.dumps(parsed, sort_keys=False, separators=(', ', ': '))
    except Exception:
        pass
    return s
`;

  // ── Main test driver ──
  let driverPy: string;

  if (structure.type === "class") {
    // Class-based problem (like LRU Cache)
    // Input format:
    //   Line 1: ["ClassName", "method1", "method2", ...]
    //   Line 2: [[initArgs], [method1Args], [method2Args], ...]
    driverPy = `
_TEST_CASES = json.loads('''${testDataPy}''')

for _tc in _TEST_CASES:
    try:
        _inp = _tc["input"]
        _lines = _inp.strip().split("\\n")
        _methods = json.loads(_lines[0])
        _args_list = json.loads(_lines[1])
        
        _results = []
        _obj = None
        for _i, _method in enumerate(_methods):
            _a = _args_list[_i] if _i < len(_args_list) else []
            if _i == 0:
                # Constructor
                _obj = ${structure.name}(*_a)
                _results.append(None)
            else:
                _ret = getattr(_obj, _method)(*_a)
                _results.append(_ret)
        
        _out_parts = []
        for _r in _results:
            if _r is None:
                _out_parts.append("null")
            elif isinstance(_r, bool):
                _out_parts.append("true" if _r else "false")
            else:
                _out_parts.append(json.dumps(_r))
        _out_str = "[" + ", ".join(_out_parts) + "]"
        print("RESULT:" + _out_str)
    except Exception as _e:
        print("RESULT:ERROR:" + str(_e))
`;
  } else if (structure.type === "function") {
    const funcName = structure.funcName!;
    const paramNames = structure.params || [];

    // Linked list conversion for input and output
    const linkedListInputConversion = usesLinkedList
      ? `
        if _name == "head" or _name == "l1" or _name == "l2":
            _v = _build_linked_list(_v)
`
      : "";

    const linkedListOutputConversion = usesLinkedList
      ? `
    # Convert linked-list result back to a plain list
    if hasattr(_result, 'val') and hasattr(_result, 'next'):
        _result = _linked_list_to_list(_result)
    elif _result is None and any(_name in ("head","l1","l2") for _name, _ in _parsed):
        _result = []
`
      : "";

    driverPy = `
_TEST_CASES = json.loads('''${testDataPy}''')

for _tc in _TEST_CASES:
    try:
        _parsed = _parse_function_args(_tc["input"])
        # Build positional args in the order declared by the function signature
        _kwargs = dict(_parsed)
        _args = []
        for _pname in ${JSON.stringify(paramNames)}:
            if _pname in _kwargs:
                _name = _pname
                _v = _kwargs[_pname]
                ${linkedListInputConversion.trim()}
                _args.append(_v)
        
        if not _args:
            # Fallback: pass values in the order they appear in the input
            for _name, _v in _parsed:
                ${linkedListInputConversion.trim()}
                _args.append(_v)
        
        _result = ${funcName}(*_args)
        ${linkedListOutputConversion.trim()}
        print("RESULT:" + _normalize_output(_result))
    except Exception as _e:
        print("RESULT:ERROR:" + str(_e))
`;
  } else {
    // Unknown structure — just run the code, no test harness
    driverPy = `
print("RESULT:ERROR:Could not detect function or class in submitted code")
`;
  }

  return `${linkedListHelpers}
${userCode}

# ─── TEST HARNESS (auto-generated) ───
${argParserPy}
${driverPy}`;
}

// ---------------------------------------------------------------------------
//  Generate JavaScript/TypeScript test harness
// ---------------------------------------------------------------------------

function buildJSTestHarness(userCode: string, testCases: TestCase[]): string {
  const structure = detectCodeStructure(userCode);
  const testDataJson = JSON.stringify(
    testCases.map((tc) => ({ input: tc.input, expected: tc.expectedOutput }))
  );

  // For JS we use a simpler approach — eval-based argument parsing
  return `${userCode}

// ─── TEST HARNESS (auto-generated) ───
const _TEST_CASES = ${testDataJson};

function _parseArgs(inputStr) {
  const parts = inputStr.split(/,\\s*(?=[a-zA-Z_]\\w*\\s*=)/);
  const args = [];
  for (const part of parts) {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) continue;
    const valStr = part.slice(eqIdx + 1).trim();
    try { args.push(eval('(' + valStr + ')')); } catch { args.push(valStr); }
  }
  return args;
}

function _normalize(val) {
  if (val === null || val === undefined) return "null";
  if (typeof val === "boolean") return val ? "true" : "false";
  return JSON.stringify(val);
}

for (const _tc of _TEST_CASES) {
  try {
    const _args = _parseArgs(_tc.input);
    const _result = ${structure.funcName || structure.name || "solution"}(..._args);
    console.log("RESULT:" + _normalize(_result));
  } catch (e) {
    console.log("RESULT:ERROR:" + e.message);
  }
}
`;
}

// ---------------------------------------------------------------------------
//  Top-level harness dispatcher
// ---------------------------------------------------------------------------

function wrapCodeWithTestHarness(userCode: string, testCases: TestCase[], language: string): string {
  const lang = (language || "python").toLowerCase();

  if (lang.includes("python")) {
    return buildPythonTestHarness(userCode, testCases);
  }

  if (lang.includes("javascript") || lang.includes("typescript") || lang === "js" || lang === "ts") {
    return buildJSTestHarness(userCode, testCases);
  }

  // For C++/Java/Go — no harness yet, just run the code as-is
  return userCode;
}

// ---------------------------------------------------------------------------
//  Honest fallback when Piston API is unreachable
// ---------------------------------------------------------------------------

function runLocalFallbackEvaluator(userCode: string, language: string, testCases: TestCase[]): CodeExecutionResult {
  // We CANNOT execute code locally in the browser.
  // Return an honest system error instead of faking results.
  return {
    status: "system_error",
    systemError:
      "Code execution service (Piston API) is currently unreachable. " +
      "Your code could not be tested. Please try again in a moment.",
    results: testCases.map((tc, idx) => ({
      caseId: tc.id || `case_${idx + 1}`,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: "⚠️ Execution unavailable",
      passed: false,
    })),
    passCount: 0,
    totalCount: testCases.length,
  };
}

// ---------------------------------------------------------------------------
//  Normalize output strings for comparison
// ---------------------------------------------------------------------------

function normalizeForCompare(s: string): string {
  let trimmed = s.trim();
  // Try to parse as JSON and re-serialize for consistent formatting
  try {
    const parsed = JSON.parse(trimmed);
    return JSON.stringify(parsed);
  } catch {
    // Not JSON — compare as plain string
  }
  // Normalize boolean representations
  if (trimmed === "True") return "true";
  if (trimmed === "False") return "false";
  if (trimmed === "None") return "null";
  return trimmed;
}

// ---------------------------------------------------------------------------
//  Main execution function
// ---------------------------------------------------------------------------

export async function executeCodeInSandbox(
  userCode: string,
  language: string,
  testCases: TestCase[]
): Promise<CodeExecutionResult> {
  const langConfig = JUDGE0_LANGUAGE_MAP[(language || "python").toLowerCase()] || JUDGE0_LANGUAGE_MAP.python;
  const wrappedContent = wrapCodeWithTestHarness(userCode, testCases, langConfig.pistonLang);

  try {
    console.log(`[Judge0] POST ${JUDGE0_ENDPOINT} (language_id: ${langConfig.languageId})`);

    const res = await fetch(JUDGE0_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        source_code: wrappedContent,
        language_id: langConfig.languageId,
        stdin: "",
        cpu_time_limit: 5,
        wall_time_limit: 10,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`[Judge0] HTTP ${res.status}: ${errText}`);
      return runLocalFallbackEvaluator(userCode, language, testCases);
    }

    const data = await res.json();

    // Judge0 status IDs:
    //   1 = In Queue, 2 = Processing, 3 = Accepted,
    //   5 = Time Limit Exceeded, 6 = Compilation Error,
    //   7-12 = Runtime Errors, 11 = Runtime Error (NZEC), 13 = Internal Error
    const statusId = data.status?.id;

    // ── Compilation error (status 6) ──
    if (statusId === 6) {
      const compileOut = data.compile_output || data.stderr || "Compilation error";
      const loc = extractErrorLocation(compileOut, language);
      const formatted = formatLeetCodeCompileError(compileOut, language, loc.line, loc.column);
      return {
        status: "compile_error",
        compileError: { rawError: formatted, line: loc.line, column: loc.column },
      };
    }

    // ── Runtime errors (status 7-12) or Time Limit Exceeded (5) ──
    if (statusId === 5) {
      return {
        status: "runtime_error",
        runtimeError: "Time Limit Exceeded — your solution took too long to execute.",
      };
    }

    if (statusId >= 7 && statusId <= 12) {
      const stderr = data.stderr || data.compile_output || "Runtime error";
      // Check for syntax/indentation errors reported at runtime (Python)
      if (stderr.includes("SyntaxError") || stderr.includes("IndentationError")) {
        const loc = extractErrorLocation(stderr, language);
        const formatted = formatLeetCodeCompileError(stderr, language, loc.line, loc.column);
        return {
          status: "compile_error",
          compileError: { rawError: formatted, line: loc.line, column: loc.column },
        };
      }
      return {
        status: "runtime_error",
        runtimeError: stderr.trim(),
      };
    }

    // ── Internal error (status 13+) ──
    if (statusId === 13 || statusId === 14) {
      return runLocalFallbackEvaluator(userCode, language, testCases);
    }

    // ── Success (status 3) → parse RESULT: lines and compare ──
    const rawStdout = data.stdout || "";
    const resultLines = rawStdout
      .split("\n")
      .filter((l: string) => l.trim().startsWith("RESULT:"))
      .map((l: string) => l.trim().replace(/^RESULT:/, ""));

    const caseResults: TestExecutionCaseResult[] = testCases.map((tc, idx) => {
      const rawActual = resultLines[idx] ?? "No output";

      // Check if the test harness reported an error
      if (rawActual.startsWith("ERROR:")) {
        return {
          caseId: tc.id || `case_${idx + 1}`,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: rawActual.replace("ERROR:", "Runtime Error: "),
          passed: false,
        };
      }

      const normalizedActual = normalizeForCompare(rawActual);
      const normalizedExpected = normalizeForCompare(tc.expectedOutput);
      const passed = normalizedActual === normalizedExpected;

      return {
        caseId: tc.id || `case_${idx + 1}`,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: rawActual,
        passed,
      };
    });

    return {
      status: "success",
      results: caseResults,
      passCount: caseResults.filter((r) => r.passed).length,
      totalCount: testCases.length,
      stdout: rawStdout,
    };
  } catch (err) {
    console.warn("[Judge0] Network error:", err);
    return runLocalFallbackEvaluator(userCode, language, testCases);
  }
}
