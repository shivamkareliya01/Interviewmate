import React, { useState } from "react";
import { Check, Copy, Code2 } from "lucide-react";

interface ChatMessageContentProps {
  content: string;
  sender: "user" | "ai";
  activeLanguage?: string;
}

interface CodeBlockProps {
  code: string;
  language?: string;
  activeLanguage?: string;
}

function detectCodeLanguage(code: string, explicitLang?: string, fallbackLang?: string): string {
  const cleanCode = code || "";

  // 1. Content-based precision language detection FIRST to override wrong AI markdown tags
  const isCpp =
    /\b(#include|unordered_map|vector|nullptr|std::|using namespace std|cout|cin|struct Node|Node\s*\*|delete\s+|new\s+Node|public:|private:|protected:|int\s+main|const\s+auto&|nullptr_t|template\s*<)\b/.test(cleanCode) ||
    (cleanCode.includes("class ") && cleanCode.includes("public:")) ||
    cleanCode.includes("Node*") ||
    cleanCode.includes("Node *") ||
    cleanCode.includes("->key") ||
    cleanCode.includes("->val") ||
    cleanCode.includes("->next") ||
    cleanCode.includes("->prev");

  if (isCpp) return "C++";

  const isJava = /\b(public\s+class|System\.out\.println|ArrayList|HashMap|package\s+com\.)\b/.test(cleanCode);
  if (isJava) return "JAVA";

  const isPython = /\b(def\s+|import\s+typing|elif\s+|print\(|self\.|defaultdict|__init__)\b/.test(cleanCode);
  if (isPython) return "PYTHON";

  const isJs = /\b(const\s+|let\s+|var\s+|console\.log|=>|function\s+)\b/.test(cleanCode);
  if (isJs) return "JAVASCRIPT";

  // 2. Explicit Language Tag (if content detection didn't confidently catch it)
  const langTag = (explicitLang || "").toLowerCase().trim();
  if (langTag && langTag !== "code" && langTag !== "text" && langTag !== "unknown") {
    if (langTag === "cpp" || langTag === "c++" || langTag === "c") return "C++";
    if (langTag === "js" || langTag === "javascript") return "JAVASCRIPT";
    if (langTag === "ts" || langTag === "typescript") return "TYPESCRIPT";
    if (langTag === "py" || langTag === "python" || langTag === "python3") return "PYTHON";
    if (langTag === "java") return "JAVA";
    if (langTag === "go" || langTag === "golang") return "GO";
    return langTag.toUpperCase();
  }

  // 3. Fallback Language (from Active Editor)
  if (fallbackLang) {
    const fb = fallbackLang.toLowerCase().trim();
    if (fb.includes("cpp") || fb.includes("c++") || fb === "c") return "C++";
    if (fb.includes("python") || fb === "py") return "PYTHON";
    if (fb.includes("javascript") || fb === "js") return "JAVASCRIPT";
    if (fb.includes("typescript") || fb === "ts") return "TYPESCRIPT";
    if (fb.includes("java") && !fb.includes("script")) return "JAVA";
    if (fb.includes("go")) return "GO";
  }

  return "CODE";
}

function CodeBlock({ code, language = "code", activeLanguage }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = detectCodeLanguage(code, language, activeLanguage);

  return (
    <div className="my-2.5 overflow-hidden rounded-xl bg-slate-950/90 border border-slate-800 shadow-lg text-left font-sans">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800/80 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 text-teal-400 font-semibold tracking-wider">
          <Code2 className="size-3.5" />
          {displayLang}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 hover:text-white transition-colors px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-400" />
              <span className="text-emerald-400 font-sans font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span className="font-sans font-medium">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-[11.5px] font-mono leading-relaxed text-emerald-300/90 whitespace-pre-wrap break-words tab-4">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Render formatted message content with syntax-highlighted code blocks,
 * inline backticks, bolding, and whitespace/line-break preservation.
 */
export function ChatMessageContent({ content, sender, activeLanguage }: ChatMessageContentProps) {
  if (!content) return null;

  const codeBlockRegex = /```([a-zA-Z0-9_+-]*)\s*\n?([\s\S]*?)```/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      elements.push(
        <TextSegment key={`text-${lastIndex}`} text={textBefore} sender={sender} />
      );
    }

    const rawLang = match[1]?.trim() || "code";
    const codeContent = match[2]?.replace(/\n$/, "") || "";

    elements.push(
      <CodeBlock key={`code-${match.index}`} code={codeContent} language={rawLang} activeLanguage={activeLanguage} />
    );

    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    elements.push(
      <TextSegment key={`text-${lastIndex}`} text={remainingText} sender={sender} />
    );
  }

  // Fallback: If no markdown code block backticks were used, check if the content is raw code
  if (elements.length === 1 && typeof content === "string" && !content.includes("```")) {
    const codeKeywordsPattern = /^\s*(#include|def|function|class|import|from|const|let|var|public|private|static|return|if|for|while|struct|select)\b/m;
    const hasCodeStructure = (codeKeywordsPattern.test(content) && content.includes("\n")) ||
      (content.includes(" = ") && content.includes("def ")) ||
      (content.includes("unordered_map") || content.includes("buckets =") || content.includes("Node*") || content.includes("Node *"));

    if (hasCodeStructure) {
      return <CodeBlock code={content.trim()} language="code" activeLanguage={activeLanguage} />;
    }
  }

  return <div className="space-y-1">{elements}</div>;
}

function TextSegment({ text, sender }: { text: string; sender: "user" | "ai" }) {
  const lines = text.split("\n");

  return (
    <div className="whitespace-pre-wrap break-words leading-relaxed">
      {lines.map((line, lineIdx) => {
        const parts: React.ReactNode[] = [];
        const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
        let inlineMatch: RegExpExecArray | null;
        let lastInIdx = 0;

        while ((inlineMatch = inlineRegex.exec(line)) !== null) {
          if (inlineMatch.index > lastInIdx) {
            parts.push(line.substring(lastInIdx, inlineMatch.index));
          }
          const matched = inlineMatch[0];
          if (matched.startsWith("`") && matched.endsWith("`")) {
            const inlineCode = matched.slice(1, -1);
            parts.push(
              <code
                key={`inline-${inlineMatch.index}`}
                className="font-mono text-[11px] bg-slate-800/90 text-teal-300 px-1.5 py-0.5 rounded border border-slate-700/60"
              >
                {inlineCode}
              </code>
            );
          } else if (matched.startsWith("**") && matched.endsWith("**")) {
            const boldText = matched.slice(2, -2);
            parts.push(
              <strong key={`bold-${inlineMatch.index}`} className="font-semibold text-slate-100">
                {boldText}
              </strong>
            );
          }
          lastInIdx = inlineMatch.index + matched.length;
        }

        if (lastInIdx < line.length) {
          parts.push(line.substring(lastInIdx));
        }

        return (
          <React.Fragment key={lineIdx}>
            {parts}
            {lineIdx < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
