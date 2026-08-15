import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Terminal,
  ChevronUp,
  ChevronDown,
  AlertOctagon,
  AlertTriangle,
  Check,
  X,
  Loader2,
  ServerOff,
  RotateCcw,
} from "lucide-react";
import { type TestCase, type CodeExecutionResult } from "@/lib/piston";

interface TestRunnerPanelProps {
  testCases: TestCase[];
  onTestCasesChange?: (updatedCases: TestCase[]) => void;
  executionResult: CodeExecutionResult | null;
  isRunning: boolean;
  activeTab: "testcase" | "testresult";
  onTabChange: (tab: "testcase" | "testresult") => void;
  onRetry?: () => void;
}

export function TestRunnerPanel({
  testCases,
  onTestCasesChange,
  executionResult,
  isRunning,
  activeTab,
  onTabChange,
  onRetry,
}: TestRunnerPanelProps) {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Reset selected case tab to 0 whenever testCases changes for a new challenge
  useEffect(() => {
    setSelectedCaseIdx(0);
  }, [testCases]);

  const sampleCases = testCases.filter((tc) => tc.isSample !== false);
  const currentCase = sampleCases[selectedCaseIdx] || sampleCases[0];

  const handleInputChange = (newInput: string) => {
    if (!onTestCasesChange || !currentCase) return;
    const updated = testCases.map((tc) =>
      tc.id === currentCase.id ? { ...tc, input: newInput } : tc
    );
    onTestCasesChange(updated);
  };

  if (isCollapsed) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setIsCollapsed(false);
              onTabChange("testcase");
            }}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white font-medium"
          >
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>Testcase</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCollapsed(false);
              onTabChange("testresult");
            }}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white font-medium"
          >
            <Terminal className="size-4 text-cyan-400" />
            <span>Test Result</span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="text-slate-400 hover:text-white p-1"
          title="Expand Panel"
        >
          <ChevronUp className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl space-y-0 text-xs select-none">
      {/* Panel Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-300">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onTabChange("testcase")}
            className={`flex items-center gap-1.5 font-semibold transition-colors relative py-1 ${
              activeTab === "testcase"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>Testcase</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("testresult")}
            className={`flex items-center gap-1.5 font-semibold transition-colors relative py-1 ${
              activeTab === "testresult"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="size-4 text-cyan-400" />
            <span>Test Result</span>
            {executionResult && (
              <span
                className={`size-2 rounded-full ${
                  executionResult.status === "compile_error" || executionResult.status === "runtime_error"
                    ? "bg-red-500 animate-ping"
                    : executionResult.status === "system_error"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-emerald-400"
                }`}
              />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className="text-slate-400 hover:text-white transition-colors p-1"
          title="Collapse Panel"
        >
          <ChevronDown className="size-4" />
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="p-4 bg-slate-950 min-h-[160px]">
        {/* TAB 1: TESTCASE TAB */}
        {activeTab === "testcase" && (
          <div className="space-y-4">
            {/* Case Selector Tabs */}
            <div className="flex items-center gap-2">
              {sampleCases.map((tc, idx) => (
                <button
                  key={tc.id || idx}
                  type="button"
                  onClick={() => setSelectedCaseIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCaseIdx === idx
                      ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                      : "bg-slate-950 text-slate-400 hover:bg-slate-900 border border-transparent"
                  }`}
                >
                  Case {idx + 1}
                </button>
              ))}
            </div>

            {/* Editable Input & Output Display */}
            {currentCase && (
              <div className="space-y-3 font-mono">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-sans text-slate-400 uppercase font-semibold tracking-wider">
                    Input:
                  </label>
                  <textarea
                    value={currentCase.input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50 font-mono resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-sans text-slate-400 uppercase font-semibold tracking-wider">
                    Expected Output:
                  </label>
                  <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5 text-xs text-emerald-400 font-mono">
                    {currentCase.expectedOutput}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TEST RESULT TAB */}
        {activeTab === "testresult" && (
          <div>
            {isRunning ? (
              <div className="flex items-center justify-center py-10 gap-3 text-slate-400 italic">
                <Loader2 className="size-5 animate-spin text-cyan-400" />
                <span>Running test harness sandbox...</span>
              </div>
            ) : !executionResult ? (
              <div className="text-center py-8 text-slate-500 space-y-1 font-sans">
                <p className="text-xs font-medium text-slate-400">No test results available yet.</p>
                <p className="text-[11px]">Click "Run" or "Submit Solution" to execute your code.</p>
              </div>
            ) : executionResult.status === "system_error" ? (
              /* --- NEUTRAL INFRASTRUCTURE SERVICE ERROR PANEL (NO FAKE COMPILE ERROR) --- */
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-3 font-sans">
                <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <ServerOff className="size-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Execution Service Unavailable</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {executionResult.systemError || "We couldn't run your code right now — please try again in a moment."}
                  </p>
                </div>

                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors mt-2"
                  >
                    <RotateCcw className="size-3.5 text-teal-400" />
                    <span>Try Again</span>
                  </button>
                )}
              </div>
            ) : executionResult.status === "compile_error" ? (
              /* --- GENUINE LEETCODE COMPILE ERROR PANEL --- */
              <div className="space-y-3 font-mono">
                <h3 className="text-lg font-bold text-red-500 tracking-tight flex items-center gap-2 font-sans">
                  <AlertOctagon className="size-5 text-red-500" />
                  Compile Error
                </h3>

                {/* Dark Red Box with Verbatim Terminal Error Text */}
                <div className="rounded-xl border border-red-500/30 bg-[#281c1c] p-4 text-xs text-red-200 font-mono leading-relaxed whitespace-pre-wrap shadow-inner overflow-x-auto">
                  {executionResult.compileError?.rawError || "Compile Error: Unknown error during compilation."}
                </div>
              </div>
            ) : executionResult.status === "runtime_error" ? (
              /* --- RUNTIME ERROR PANEL --- */
              <div className="space-y-3 font-mono">
                <h3 className="text-lg font-bold text-amber-500 tracking-tight flex items-center gap-2 font-sans">
                  <AlertTriangle className="size-5 text-amber-500" />
                  Runtime Error
                </h3>

                <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-4 text-xs text-amber-200 font-mono leading-relaxed whitespace-pre-wrap shadow-inner overflow-x-auto">
                  {executionResult.runtimeError || "Runtime Error: Execution terminated with non-zero status."}
                </div>
              </div>
            ) : (
              /* --- SUCCESS / ACCEPTED / WRONG ANSWER RESULTS --- */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg font-bold ${
                        executionResult.passCount === executionResult.totalCount
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {executionResult.passCount === executionResult.totalCount ? "Accepted" : "Wrong Answer"}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {executionResult.passCount} / {executionResult.totalCount} test cases passed
                    </span>
                  </div>
                </div>

                {/* Per-Case Details */}
                <div className="space-y-3 font-mono">
                  {executionResult.results?.map((res, idx) => (
                    <div
                      key={res.caseId || idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-sans font-semibold">Case {idx + 1}</span>
                        {res.passed ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-sans font-bold text-[11px]">
                            <Check className="size-3.5" /> Passed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400 font-sans font-bold text-[11px]">
                            <X className="size-3.5" /> Failed
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-slate-500 font-sans block text-[10px]">Expected:</span>
                          <span className="text-emerald-400">{res.expectedOutput}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-sans block text-[10px]">Output:</span>
                          <span className={res.passed ? "text-slate-300" : "text-red-300 font-bold"}>
                            {res.actualOutput}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
