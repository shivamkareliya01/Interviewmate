export interface LanguageOption {
  id: string;
  name: string;
  monacoLang: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { id: "python", name: "Python 3", monacoLang: "python" },
  { id: "javascript", name: "JavaScript (ES6)", monacoLang: "javascript" },
  { id: "typescript", name: "TypeScript", monacoLang: "typescript" },
  { id: "java", name: "Java 17", monacoLang: "java" },
  { id: "cpp", name: "C++ 20", monacoLang: "cpp" },
  { id: "c", name: "C (GCC)", monacoLang: "c" },
  { id: "go", name: "Go 1.21", monacoLang: "go" },
];

/**
 * Generates language-specific starter code for any question title.
 */
export function getStarterCodeForLanguage(
  questionTitle: string,
  languageId: string,
  basePythonStarter?: string | null
): string {
  const lang = (languageId || "python").toLowerCase();

  if ((lang === "python" || lang === "python3") && basePythonStarter) {
    return basePythonStarter;
  }

  const funcName = questionTitle
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join("");

  const pascalName = questionTitle
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");

  switch (lang) {
    case "javascript":
    case "js":
      return `// Solution for: ${questionTitle}\nfunction ${funcName || "solution"}(input) {\n  // Write your JavaScript solution here\n  return null;\n}\n`;

    case "typescript":
    case "ts":
      return `// Solution for: ${questionTitle}\nfunction ${funcName || "solution"}(input: any): any {\n  // Write your TypeScript solution here\n  return null;\n}\n`;

    case "java":
      return `import java.util.*;\n\npublic class Solution {\n    public Object ${funcName || "solve"}(Object input) {\n        // Write your Java solution here\n        return null;\n    }\n}\n`;

    case "cpp":
    case "c++":
      return `#include <iostream>\n#include <vector>\n#include <string>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    void ${funcName || "solve"}() {\n        // Write your C++ solution here\n    }\n};\n`;

    case "c":
      return `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nvoid ${funcName || "solve"}() {\n    // Write your C solution here\n}\n`;

    case "go":
    case "golang":
      return `package main\n\nimport "fmt"\n\nfunc ${funcName || "Solve"}() {\n\t// Write your Go solution here\n\tfmt.Println("Solution")\n}\n`;

    case "python":
    case "python3":
    default:
      return basePythonStarter || `def ${funcName || "solution"}(*args):\n    # Write your Python solution here\n    pass\n`;
  }
}
