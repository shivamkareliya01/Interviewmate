import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Code2,
  Timer,
  Send,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  Zap,
  TrendingUp,
  Award,
  Flame,
  Loader2,
  RotateCcw,
  SlidersHorizontal,
  FileText,
  Bot,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { DesktopGate } from "@/components/DesktopGate";
import { CodeEditor } from "@/components/CodeEditor";
import { TestRunnerPanel } from "@/components/TestRunnerPanel";
import { SelectionWizard } from "@/components/SelectionWizard";
import { ChatMessageContent } from "@/components/ChatMessageContent";
import { getStarterCodeForLanguage } from "@/lib/starterCode";
import { executeCodeInSandbox, type CodeExecutionResult, type TestCase } from "@/lib/piston";
import {
  getLastSessionConfig,
  type SessionConfig,
} from "@/lib/branches";
import {
  INITIAL_CHALLENGES,
  calculateUserStats,
  saveUserSubmission,
  saveDraftCode,
  getDraftCode,
  getLastUsedLanguage,
  type Submission,
  type ScoreBreakdown,
  type FeedbackItem,
} from "@/lib/challenges";
import { evaluateCodeSubmission, askAITutor, streamGroqChat, isUnmodifiedStarterCode } from "@/lib/groq";
import { toast } from "sonner";

// Force Vite HMR Cache Refresh - India Population & Demography Handlers Active
export const Route = createFileRoute("/_authenticated/user/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | InterviewMate" },
      { name: "description", content: "AI Technical Interview Practice & Performance Dashboard." },
    ],
  }),
  component: DashboardPageWrapper,
});

function DashboardPageWrapper() {
  return (
    <DesktopGate>
      <DashboardPage />
    </DesktopGate>
  );
}

export interface ActiveChallengeState {
  challengeId: string;
  challengeIndex: number;
  title: string;
  description: string;
  referenceSolution: string;
  language: string;
  code: string;
  testCases: TestCase[];
  executionResult: CodeExecutionResult | null;
  isExecuting: boolean;
  testRunnerTab: "testcase" | "testresult";
  compileErrorLine?: number;
  compileErrorMsg?: string;
  evaluation: {
    scores: ScoreBreakdown;
    feedback: FeedbackItem[];
  } | null;
  messages: Array<{ sender: "user" | "ai"; text: string }>;
}

function DashboardPage() {
  const { user, profile } = useAuth();
  const userId = user?.id || "guest_user";
  const navigate = useNavigate();

  // Wizard modal state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [lastConfig, setLastConfig] = useState<SessionConfig | null>(() =>
    getLastSessionConfig()
  );

  // Consolidated Single Source of Truth State
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallengeState>(() => {
    let initialIdx = 0;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("interviewmate_dashboard_challenge_idx");
      const parsed = saved !== null ? parseInt(saved, 10) : NaN;
      initialIdx = Number.isInteger(parsed) && parsed >= 0
        ? (parsed + 1) % INITIAL_CHALLENGES.length
        : Math.floor(Math.random() * INITIAL_CHALLENGES.length);
      localStorage.setItem("interviewmate_dashboard_challenge_idx", initialIdx.toString());
    }

    const safeIdx = Math.abs(initialIdx) % INITIAL_CHALLENGES.length || 0;
    const baseC = INITIAL_CHALLENGES[safeIdx] || INITIAL_CHALLENGES[0];
    const savedLang = typeof window !== "undefined" ? getLastUsedLanguage(userId, baseC.id) : null;
    const lang = savedLang || "python";
    const draft = typeof window !== "undefined" ? getDraftCode(userId, baseC.id, lang) : null;
    const initialCode = draft || getStarterCodeForLanguage(baseC.title, lang, baseC.starterCode);

    return {
      challengeId: baseC.id,
      challengeIndex: safeIdx,
      title: baseC.title,
      description: baseC.description,
      referenceSolution: baseC.referenceSolution,
      language: lang,
      code: initialCode,
      testCases: baseC.testCases || [],
      executionResult: null,
      isExecuting: false,
      testRunnerTab: "testcase",
      evaluation: null,
      messages: [
        {
          sender: "ai",
          text: "Hello! I am InterviewMate AI. Ask me any question, request hints, or clarify technical concepts!",
        },
      ],
    };
  });

  const currentChallenge = INITIAL_CHALLENGES[activeChallenge.challengeIndex] || INITIAL_CHALLENGES[0];
  const questionType: "coding" | "theory" = "coding";
  const activeDomainName = lastConfig?.domainName || currentChallenge?.tags[0] || "Algorithms & Data Structures";
  const activeDifficulty: "Easy" | "Moderate" | "Difficult" | "Hard" = (lastConfig?.difficulty as any) || currentChallenge?.difficulty || "Moderate";

  // Timer state
  const [timeLeft, setTimeLeft] = useState(currentChallenge?.timeLimitSeconds || 1800);
  const [timerRunning, setTimerRunning] = useState(true);

  // User stats & submissions
  const [stats, setStats] = useState(() => calculateUserStats(userId));

  // Track active evaluation request to guard against in-flight race conditions
  const activeRequestIdRef = useRef<number>(0);

  const handleNextChallenge = () => {
    // Invalidate any in-flight evaluation requests or timer callbacks
    activeRequestIdRef.current += 1;
    setTimerRunning(false);

    // Synchronously select a random distinct index to ensure question variety
    const currentIdx = activeChallenge.challengeIndex;
    const availableIndices = INITIAL_CHALLENGES.map((_, i) => i).filter((i) => i !== currentIdx);
    const nextIdx = availableIndices.length > 0
      ? availableIndices[Math.floor(Math.random() * availableIndices.length)]
      : (currentIdx + 1) % INITIAL_CHALLENGES.length;

    const nextC = INITIAL_CHALLENGES[nextIdx] || INITIAL_CHALLENGES[0];

    if (typeof window !== "undefined") {
      localStorage.setItem("interviewmate_dashboard_challenge_idx", nextIdx.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const savedLang = typeof window !== "undefined" ? getLastUsedLanguage(userId, nextC.id) : null;
    const lang = savedLang || activeChallenge.language || "python";
    const draft = typeof window !== "undefined" ? getDraftCode(userId, nextC.id, lang) : null;
    const rawCode = draft || getStarterCodeForLanguage(nextC.title, lang, nextC.starterCode);
    const newStarter = (rawCode && rawCode !== "undefined" && rawCode !== "null") ? rawCode : (getStarterCodeForLanguage(nextC.title, lang, nextC.starterCode) || "");

    const newChallengeState: ActiveChallengeState = {
      challengeId: nextC.id,
      challengeIndex: nextIdx,
      title: nextC.title,
      description: nextC.description,
      referenceSolution: nextC.referenceSolution,
      language: lang,
      code: newStarter,
      testCases: nextC.testCases || [],
      executionResult: null,
      isExecuting: false,
      testRunnerTab: "testcase",
      compileErrorLine: undefined,
      compileErrorMsg: undefined,
      evaluation: null,
      messages: [
        {
          sender: "ai",
          text: "Hello! I am InterviewMate AI. Ask me any question, request hints, or clarify technical concepts!",
        },
      ],
    };

    setActiveChallenge(newChallengeState);
    setTimeLeft(nextC.timeLimitSeconds);
    setTimerRunning(true);
    toast.info(`Switched to new challenge: ${nextC.title}`);
  };

  const [submitting, setSubmitting] = useState(false);

  // Fast Run Button: executes code against visible sample testcases
  const handleRunCode = async () => {
    if (!activeChallenge.code.trim()) {
      toast.error("Please write your solution before running!");
      return;
    }

    const sampleCases = (activeChallenge.testCases || []).filter((tc) => tc.isSample !== false);
    const casesToRun = sampleCases.length > 0 ? sampleCases : activeChallenge.testCases;

    if (casesToRun.length === 0) {
      toast.info("No sample test cases defined for this challenge.");
      return;
    }

    setActiveChallenge((prev) => ({
      ...prev,
      isExecuting: true,
      testRunnerTab: "testresult",
      compileErrorLine: undefined,
      compileErrorMsg: undefined,
    }));

    toast.info("Executing code against sample test cases...");

    const result = await executeCodeInSandbox(
      activeChallenge.code,
      activeChallenge.language,
      casesToRun
    );

    setActiveChallenge((prev) => ({
      ...prev,
      isExecuting: false,
      executionResult: result,
      compileErrorLine: result.compileError?.line,
      compileErrorMsg: result.compileError?.rawError,
    }));

    if (result.status === "compile_error") {
      toast.error(`Compile Error on line ${result.compileError?.line || 1}! Check details in Test Result.`);
    } else if (result.status === "runtime_error") {
      toast.error("Runtime Error during code execution.");
    } else {
      toast.success(`Execution complete! Passed ${result.passCount}/${result.totalCount} sample test cases.`);
    }
  };

  // AI Chatbot thread state
  const [prompt, setPrompt] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const prevMsgCountRef = useRef<number>(activeChallenge.messages.length);

  // Only scroll chat thread when a NEW message is posted, never on question reset
  useEffect(() => {
    if (activeChallenge.messages.length > prevMsgCountRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMsgCountRef.current = activeChallenge.messages.length;
  }, [activeChallenge.messages, chatLoading]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPrompt(val);
    if (chatInputRef.current) {
      chatInputRef.current.style.height = "auto";
      chatInputRef.current.style.height = `${Math.min(chatInputRef.current.scrollHeight, 220)}px`;
    }
  };

  // Autosave code on changes
  useEffect(() => {
    saveDraftCode(userId, activeChallenge.challengeId, activeChallenge.language, activeChallenge.code);
  }, [activeChallenge.code, activeChallenge.language, userId, activeChallenge.challengeId]);

  // Timer Ticking Interval
  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerRunning, timeLeft]);

  // Submit Solution for AI Evaluation: runs against all testcases + triggers AI evaluation
  const handleSubmitSolution = async () => {
    if (!activeChallenge.code.trim()) {
      toast.error("Please write your solution before submitting!");
      return;
    }

    activeRequestIdRef.current += 1;
    const requestId = activeRequestIdRef.current;

    setSubmitting(true);
    toast.info("Running full test suite & evaluating with InterviewMate AI...");

    // Step 1: Execute against ALL testcases (sample + hidden) via Piston
    const allCases = activeChallenge.testCases || [];
    let execResult: CodeExecutionResult | null = null;

    if (allCases.length > 0) {
      setActiveChallenge((prev) => ({
        ...prev,
        isExecuting: true,
        testRunnerTab: "testresult",
        compileErrorLine: undefined,
        compileErrorMsg: undefined,
      }));

      execResult = await executeCodeInSandbox(
        activeChallenge.code,
        activeChallenge.language,
        allCases
      );

      setActiveChallenge((prev) => ({
        ...prev,
        isExecuting: false,
        executionResult: execResult,
        compileErrorLine: execResult.compileError?.line,
        compileErrorMsg: execResult.compileError?.rawError,
      }));

      if (execResult.status === "compile_error") {
        setSubmitting(false);
        toast.error(`Compile Error! Fix line ${execResult.compileError?.line || 1} before AI evaluation.`);
        return;
      }
    }

    // Step 2: Ground AI evaluation in real pass/fail test results
    const execSummary = execResult
      ? `Passed ${execResult.passCount}/${execResult.totalCount} test cases.`
      : "Code compiled successfully.";

    try {
      const res = await evaluateCodeSubmission(
        activeChallenge.title,
        activeChallenge.description,
        activeChallenge.referenceSolution,
        activeChallenge.code,
        activeDifficulty,
        activeChallenge.language,
        execSummary
      );

      if (activeRequestIdRef.current !== requestId) {
        return;
      }

      const scoreBreakdown: ScoreBreakdown = {
        correctness: execResult ? Math.round((execResult.passCount! / execResult.totalCount!) * 100) : res.correctness,
        efficiency: res.efficiency,
        codeQuality: res.codeQuality,
        testCases: res.testCases,
        overallScore: res.overallScore,
      };

      const newSubmission: Submission = {
        id: `sub_${Date.now()}`,
        userId,
        challengeId: activeChallenge.challengeId,
        code: activeChallenge.code,
        scores: scoreBreakdown,
        feedback: res.feedback,
        timeSpentSeconds: (INITIAL_CHALLENGES[activeChallenge.challengeIndex] || INITIAL_CHALLENGES[0]).timeLimitSeconds - timeLeft,
        createdAt: new Date().toISOString(),
      };

      saveUserSubmission(userId, newSubmission);
      setStats(calculateUserStats(userId));

      setActiveChallenge((prev) => {
        if (activeRequestIdRef.current !== requestId) return prev;
        return {
          ...prev,
          evaluation: {
            scores: scoreBreakdown,
            feedback: res.feedback,
          },
          messages: [
            ...prev.messages,
            {
              sender: "ai",
              text: `Evaluation complete! Overall score: ${res.overallScore}/100 (${execSummary}). ${res.feedback[0]?.text || "Great effort!"
                }`,
            },
          ],
        };
      });

      toast.success("Submission evaluated & stats updated!");
    } catch {
      if (activeRequestIdRef.current === requestId) {
        toast.error("InterviewMate AI evaluation failed.");
      }
    } finally {
      if (activeRequestIdRef.current === requestId) {
        setSubmitting(false);
      }
    }
  };

  const handleAutoSubmit = async () => {
    setTimerRunning(false);
    if (isUnmodifiedStarterCode(activeChallenge.code)) {
      console.log("[Timer Expired] Starter code was unchanged — skipping auto-evaluation.");
      return;
    }
    toast.warning("Time limit expired! Auto-submitting solution...");
    await handleSubmitSolution();
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || chatLoading) return;

    const userQuery = prompt;
    const historyPayload: Array<{ sender: "user" | "ai"; text: string }> = [
      ...activeChallenge.messages,
      { sender: "user", text: userQuery },
    ];

    setActiveChallenge((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        { sender: "user", text: userQuery },
        { sender: "ai", text: "" },
      ],
    }));

    setPrompt("");
    if (chatInputRef.current) {
      chatInputRef.current.style.height = "auto";
    }
    setChatLoading(true);

    try {
      await streamGroqChat(
        historyPayload,
        {
          questionTitle: activeChallenge.title,
          questionDescription: activeChallenge.description,
          referenceAnswer: activeChallenge.referenceSolution,
          userSolution: activeChallenge.code,
          language: activeChallenge.language,
        },
        (chunkText) => {
          setActiveChallenge((prev) => {
            const updated = [...prev.messages];
            if (updated.length > 0 && updated[updated.length - 1].sender === "ai") {
              updated[updated.length - 1] = {
                sender: "ai",
                text: chunkText,
              };
            }
            return {
              ...prev,
              messages: updated,
            };
          });
        }
      );
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "InterviewMate AI chat error.";
      toast.error(errMsg);
      setActiveChallenge((prev) => {
        const updated = [...prev.messages];
        if (updated.length > 0 && updated[updated.length - 1].sender === "ai" && !updated[updated.length - 1].text) {
          updated[updated.length - 1] = {
            sender: "ai",
            text: "⚠️ Unable to connect to InterviewMate AI. Please verify your connection or try asking again.",
          };
        }
        return {
          ...prev,
          messages: updated,
        };
      });
    } finally {
      setChatLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const displayName = profile?.first_name || user?.name?.split(" ")[0] || "Candidate";
  const displayScores = activeChallenge.evaluation
    ? activeChallenge.evaluation.scores
    : { correctness: 0, efficiency: 0, codeQuality: 0, testCases: 0, overallScore: 0 };
  const overall = displayScores.overallScore;
  const scoreLabel = activeChallenge.evaluation
    ? overall >= 85
      ? "Great!"
      : overall >= 65
        ? "Good"
        : "Needs work"
    : "Pending";
  const wordCount = activeChallenge.code.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Selection Wizard Modal */}
      <SelectionWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />

      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/80 to-teal-950/40 border border-teal-500/20 backdrop-blur-xl shadow-xl shadow-teal-950/20">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Sharpen your technical, engineering, and analytical interview skills with InterviewMate AI.
          </p>

          {/* Quick Continue Shortcut */}
          {lastConfig && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-400">Last Session:</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setWizardOpen(true)}
                className="border-teal-500/40 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 text-xs rounded-xl gap-1.5 h-7"
              >
                <Zap className="size-3 text-amber-400 fill-amber-400" />
                <span>
                  Quick Continue: {lastConfig.domainName} · {lastConfig.difficulty}
                </span>
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setWizardOpen(true)}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl gap-2 shadow-lg shadow-teal-500/20"
          >
            <SlidersHorizontal className="size-4" />
            Start New Session Wizard
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Flame className="size-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span>🔥 {stats.streakCount} Day Streak</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Award className="size-4 text-cyan-400" />
              <span>🏅 {stats.totalPoints} Points</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Section: Challenge Prompt + Editor */}
        <div className="lg:col-span-7 space-y-6 flex flex-col">
          <div className="flex-1 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
                    {questionType === "coding" ? <Code2 className="size-4" /> : <FileText className="size-4" />}
                  </div>
                  <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                    {questionType === "coding" ? "Coding Challenge" : "Technical Conceptual Challenge"}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {activeChallenge.title}
                </h2>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed font-sans">
                  {activeChallenge.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="bg-teal-500/10 text-teal-300 border-teal-500/30 text-[11px]">
                    {activeDomainName}
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-[11px]">
                    {questionType === "coding" ? "Coding" : "Theory / Written Explanation"}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${activeDifficulty === "Easy"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : activeDifficulty === "Moderate"
                        ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                        : "bg-red-500/10 border border-red-500/30 text-red-400"
                    }`}
                >
                  {activeDifficulty}
                </span>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Timer className="size-3.5 text-teal-400" />
                  <span>⏱ {formatTime(timeLeft)}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNextChallenge}
                  className="border-teal-500/30 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 text-xs gap-1.5 rounded-lg h-8"
                  title="Switch to another coding challenge"
                >
                  <RotateCcw className="size-3 text-teal-400" />
                  <span>Next Challenge</span>
                </Button>
              </div>
            </div>

            {/* Solution Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="text-teal-400 font-semibold uppercase">
                  {questionType === "coding" ? "Code Editor" : "Written Response"}
                </span>
                <span className="text-[11px] text-slate-500">
                  {questionType === "coding" ? "Auto-saved draft" : `${wordCount} words`}
                </span>
              </div>

              {questionType === "coding" ? (
                <div className="space-y-4">
                  <CodeEditor
                    value={activeChallenge.code}
                    onChange={(newCode) =>
                      setActiveChallenge((prev) => ({ ...prev, code: newCode }))
                    }
                    language={activeChallenge.language}
                    onLanguageChange={(newLang, newCode) => {
                      setActiveChallenge((prev) => ({
                        ...prev,
                        language: newLang,
                        code: newCode,
                      }));
                    }}
                    questionTitle={activeChallenge.title}
                    baseStarterCode={INITIAL_CHALLENGES[activeChallenge.challengeIndex]?.starterCode}
                    compileErrorLine={activeChallenge.compileErrorLine}
                    compileErrorMsg={activeChallenge.compileErrorMsg}
                  />

                  {/* LeetCode-style Testcases & Test Result Panel */}
                  <TestRunnerPanel
                    testCases={activeChallenge.testCases}
                    onTestCasesChange={(updatedCases) =>
                      setActiveChallenge((prev) => ({ ...prev, testCases: updatedCases }))
                    }
                    executionResult={activeChallenge.executionResult}
                    isRunning={activeChallenge.isExecuting}
                    activeTab={activeChallenge.testRunnerTab}
                    onTabChange={(tab) =>
                      setActiveChallenge((prev) => ({ ...prev, testRunnerTab: tab }))
                    }
                    onRetry={handleRunCode}
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <Textarea
                    value={activeChallenge.code}
                    onChange={(e) => setActiveChallenge((prev) => ({ ...prev, code: e.target.value }))}
                    placeholder="Write your technical explanation, formula derivations, or architectural reasoning here..."
                    className="min-h-[260px] bg-transparent border-none text-xs text-slate-200 placeholder:text-slate-500 focus-visible:ring-0 resize-none font-sans leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveChallenge((prev) => ({ ...prev, code: "" }))}
                  className="border-slate-800 text-slate-400 hover:text-white text-xs gap-1.5"
                >
                  <RotateCcw className="size-3.5" /> Clear Response
                </Button>

                {questionType === "coding" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRunCode}
                    disabled={activeChallenge.isExecuting || submitting}
                    className="border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs gap-1.5 font-bold shadow-md"
                  >
                    {activeChallenge.isExecuting && activeChallenge.testRunnerTab === "testresult" ? (
                      <Loader2 className="size-3.5 animate-spin text-emerald-400" />
                    ) : (
                      <Play className="size-3.5 text-emerald-400 fill-emerald-400" />
                    )}
                    <span>Run</span>
                  </Button>
                )}
              </div>

              <Button
                onClick={handleSubmitSolution}
                disabled={submitting || activeChallenge.isExecuting}
                className="bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-teal-500/20 gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Evaluating...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" /> Submit Solution for AI Evaluation
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Section: Interactive AI Chatbot & Performance Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Performance Widget */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-5 shadow-2xl space-y-5">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center justify-between">
              <span>Your Performance</span>
              <TrendingUp className="size-4 text-teal-400" />
            </h3>

            <div className="flex items-center justify-between gap-4">
              {/* Radial Score Gauge */}
              <div className="relative size-28 flex flex-col items-center justify-center flex-shrink-0">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-teal-400 transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]"
                    strokeDasharray={`${overall}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-white leading-none">{overall}</span>
                  <span className="text-[10px] text-slate-400 font-medium">/100</span>
                  <span className={`text-[10px] font-bold mt-1 ${activeChallenge.evaluation ? "text-teal-400" : "text-slate-500"}`}>
                    {scoreLabel}
                  </span>
                </div>
              </div>

              {/* Score Bars */}
              <div className="flex-1 space-y-2.5">
                {[
                  { name: "Correctness", score: displayScores.correctness },
                  { name: "Efficiency", score: displayScores.efficiency },
                  { name: "Code Quality", score: displayScores.codeQuality },
                  { name: "Test Cases", score: displayScores.testCases },
                ].map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-400 text-[11px]">{item.name}</span>
                      <span className="text-white text-[11px]">
                        {item.score}
                        <span className="text-slate-500">/100</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!activeChallenge.evaluation && (
              <p className="text-[10px] text-slate-500 text-center font-medium pt-1">
                Submit your solution to analyse performance and receive live scores.
              </p>
            )}
          </div>

          {/* Dedicated Interactive AI Interviewer Chatbot Panel */}
          <div className="rounded-2xl bg-slate-900/70 border border-teal-500/20 backdrop-blur-xl p-5 shadow-2xl space-y-4 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="relative flex size-8 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
                  <Bot className="size-4" />
                  <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-teal-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">AI Interviewer Chat</h3>
                  <p className="text-[10px] text-teal-400/90 font-medium">Powered by InterviewMate AI</p>
                </div>
              </div>
              <Badge variant="outline" className="border-teal-500/30 text-teal-300 text-[10px]">
                Online
              </Badge>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {activeChallenge.messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 text-xs ${m.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  {m.sender === "ai" && (
                    <div className="size-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-teal-500/30">
                      <Bot className="size-3.5" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl max-w-[88%] text-xs leading-relaxed ${m.sender === "user"
                        ? "bg-teal-500/20 text-teal-200 border border-teal-500/30 rounded-tr-none"
                        : "bg-slate-950 text-slate-200 border border-slate-800/80 rounded-tl-none shadow-inner"
                      }`}
                  >
                    <ChatMessageContent content={m.text} sender={m.sender} activeLanguage={activeChallenge.language} />
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <Loader2 className="size-3.5 animate-spin text-teal-400" />
                  InterviewMate AI is typing...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex items-end gap-2 pt-2 border-t border-slate-800">
              <textarea
                ref={chatInputRef}
                value={prompt}
                onChange={handlePromptChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (prompt.trim() && !chatLoading) {
                      handleSendChat(e as unknown as React.FormEvent);
                    }
                  }
                }}
                placeholder="Ask AI Interviewer or paste code... (Shift+Enter for newline)"
                rows={1}
                className={`flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-teal-500/50 transition-colors max-h-56 min-h-[42px] leading-relaxed ${prompt.includes("\n") || /\b(def|function|class|import|return|buckets|for|if|while|const|let|var)\b/.test(prompt)
                    ? "font-mono text-[11.5px]"
                    : "font-sans"
                  }`}
              />
              <Button
                type="submit"
                disabled={chatLoading || !prompt.trim()}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 size-9 rounded-xl flex-shrink-0 p-0 flex items-center justify-center disabled:opacity-50"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
