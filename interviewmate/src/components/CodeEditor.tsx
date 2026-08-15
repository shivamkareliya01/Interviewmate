import { useEffect, useState, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import {
  Code2,
  Lock,
  Wand2,
  Bookmark,
  Braces,
  RotateCcw,
  Maximize2,
  Minimize2,
  CheckCircle2,
} from "lucide-react";
import { SUPPORTED_LANGUAGES, getStarterCodeForLanguage } from "@/lib/starterCode";
import { toast } from "sonner";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  onLanguageChange?: (newLanguage: string, newCode: string) => void;
  readOnly?: boolean;
  questionTitle?: string;
  baseStarterCode?: string | null;
  compileErrorLine?: number;
  compileErrorMsg?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = "python",
  onLanguageChange,
  readOnly = false,
  questionTitle = "Coding Challenge",
  baseStarterCode = null,
  compileErrorLine,
  compileErrorMsg,
}: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [isBookmarked, setIsBookmarked] = useState(false);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mapMonacoLanguage = (lang: string) => {
    const l = (lang || "python").toLowerCase();
    if (l.includes("python")) return "python";
    if (l.includes("javascript") || l === "js") return "javascript";
    if (l.includes("typescript") || l === "ts") return "typescript";
    if (l.includes("java") && !l.includes("script")) return "java";
    if (l.includes("cpp") || l.includes("c++")) return "cpp";
    if (l === "c") return "c";
    if (l.includes("go")) return "go";
    return "python";
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track cursor position dynamically
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, col: e.position.column });
    });
  };

  // Set red error squigglies & gutter markers on Monaco editor when compile error line is set
  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        if (compileErrorLine && compileErrorLine > 0) {
          monacoRef.current.editor.setModelMarkers(model, "compiler", [
            {
              startLineNumber: compileErrorLine,
              startColumn: 1,
              endLineNumber: compileErrorLine,
              endColumn: 1000,
              message: compileErrorMsg || "Compile Error: Check function syntax or return type.",
              severity: monacoRef.current.MarkerSeverity.Error,
            },
          ]);
          editorRef.current.revealLineInCenter(compileErrorLine);
        } else {
          monacoRef.current.editor.setModelMarkers(model, "compiler", []);
        }
      }
    }
  }, [compileErrorLine, compileErrorMsg]);

  const handleSelectLanguage = (targetLangId: string) => {
    if (targetLangId === language) return;
    const newCode = getStarterCodeForLanguage(questionTitle, targetLangId, baseStarterCode);
    if (onLanguageChange) {
      onLanguageChange(targetLangId, newCode);
    } else {
      onChange(newCode);
    }
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run();
      toast.success("Code auto-formatted!");
    }
  };

  const handleResetCode = () => {
    const starter = getStarterCodeForLanguage(questionTitle, language, baseStarterCode);
    onChange(starter);
    toast.info("Editor code reset to initial starter skeleton.");
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Removed from saved snippets." : "Code snippet saved to bookmarks!");
  };

  const handleInsertSnippet = () => {
    const snippet = `// InterviewMate AI Snippet\n`;
    onChange(value + "\n" + snippet);
    toast.info("Snippet inserted.");
  };

  if (!mounted) {
    return (
      <div className="h-72 w-full rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-400 flex items-center justify-center border border-slate-800">
        Loading Code Editor...
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl relative transition-all ${
        isFullscreen ? "fixed inset-4 z-50 flex flex-col h-[calc(100vh-32px)]" : ""
      }`}
    >
      {/* Editor Header Row 1: Code Title */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Code2 className="size-4 text-teal-400" />
          <span className="font-semibold text-white tracking-wide uppercase text-[11px]">
            &lt;/&gt; Code
          </span>
        </div>
      </div>

      {/* Editor Header Row 2: Sub-toolbar Controls matching Reference */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
            <select
              value={language}
              disabled={readOnly}
              onChange={(e) => handleSelectLanguage(e.target.value)}
              className="bg-transparent text-xs text-teal-300 font-semibold focus:outline-none cursor-pointer py-0.5"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-slate-950 text-slate-200">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Indent Mode Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-[10px] text-slate-400 font-mono border border-slate-800">
            <Lock className="size-3 text-slate-500" />
            <span>Auto</span>
          </div>
        </div>

        {/* Right Toolbar Action Icons */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <button
            type="button"
            onClick={handleFormatCode}
            className="p-1.5 hover:bg-slate-900 hover:text-white rounded-lg transition-colors"
            title="Format Code"
          >
            <Wand2 className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleBookmark}
            className={`p-1.5 hover:bg-slate-900 rounded-lg transition-colors ${
              isBookmarked ? "text-amber-400 fill-amber-400" : "hover:text-white"
            }`}
            title="Bookmark Snippet"
          >
            <Bookmark className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={handleInsertSnippet}
            className="p-1.5 hover:bg-slate-900 hover:text-white rounded-lg transition-colors"
            title="Insert Template Snippet"
          >
            <Braces className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetCode}
            className="p-1.5 hover:bg-slate-900 hover:text-white rounded-lg transition-colors"
            title="Reset Starter Code"
          >
            <RotateCcw className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-slate-900 hover:text-white rounded-lg transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Expand"}
          >
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className={isFullscreen ? "flex-1" : ""}>
        <Editor
          height={isFullscreen ? "100%" : "320px"}
          language={mapMonacoLanguage(language)}
          theme="vs-dark"
          value={value && value !== "undefined" && value !== "null" ? value : ""}
          onChange={(val) => onChange(val || "")}
          onMount={handleEditorMount}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "Fira Code, monospace, Consolas, Menlo",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            cursorBlinking: "smooth",
            smoothScrolling: true,
            glyphMargin: true,
          }}
        />
      </div>

      {/* Bottom Status Bar matching Reference UI */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3 text-emerald-400" />
          <span>Auto-saved draft</span>
        </div>

        <div>
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
        </div>
      </div>
    </div>
  );
}
