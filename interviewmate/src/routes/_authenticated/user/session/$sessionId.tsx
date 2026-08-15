import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Code2,
  Timer,
  Sparkles,
  Loader2,
  RotateCcw,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Bot,
  Trophy,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { CodeEditor } from "@/components/CodeEditor";
import { MCQQuestionCard } from "@/components/MCQQuestionCard";
import { ConversationalMockCard } from "@/components/ConversationalMockCard";
import {
  getSessionById,
  updateSessionRecord,
  getRecentlySeenTitles,
  recordRecentlySeenTitles,
  type PracticeSession,
} from "@/lib/sessionStore";
import {
  calculateUserStats,
  saveUserSubmission,
  saveDraftCode,
  getDraftCode,
  type Submission,
  type ScoreBreakdown,
  type FeedbackItem,
} from "@/lib/challenges";
import { generateGroqQuestions, evaluateCodeSubmission, isTechSoftwareDomain } from "@/lib/groq";
import { saveQuestionsToBank, type BankQuestion } from "@/lib/questionBank";
import { toast } from "sonner";

import { ErrorBoundary } from "@/components/ErrorBoundary";

export const Route = createFileRoute("/_authenticated/user/session/$sessionId")({
  head: () => ({
    meta: [
      { title: "Practice Session | InterviewMate" },
      { name: "description", content: "10-Question AI Technical Practice Session" },
    ],
  }),
  component: SessionPageWrapper,
});

function SessionPageWrapper() {
  return (
    <ErrorBoundary title="Session Load Error">
      <SessionPage />
    </ErrorBoundary>
  );
}

function SessionPage() {
  const navigate = useNavigate();
  const { sessionId } = Route.useParams();
  const { user } = useAuth();
  const userId = user?.id || "guest_user";

  const [session, setSession] = useState<PracticeSession | null>(() =>
    getSessionById(sessionId)
  );

  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(() => session?.currentQuestionIndex || 0);

  // Load session metadata on mount
  useEffect(() => {
    const s = getSessionById(sessionId);
    if (!s) {
      toast.error("Session not found");
      navigate({ to: "/user/practice" });
      return;
    }
    setSession(s);

    if (s.questions && s.questions.length > 0) {
      setLoadingQuestions(false);
      return;
    }

    // Generate fresh questions via Groq AI
    fetchFreshQuestions(s);
  }, [sessionId]);

  const fetchFreshQuestions = async (s: PracticeSession) => {
    setLoadingQuestions(true);
    try {
      const recentlySeen = getRecentlySeenTitles();
      const generatedQuestions = await generateGroqQuestions(
        s.branchName,
        s.domainName,
        s.difficulty,
        recentlySeen
      );

      recordRecentlySeenTitles(generatedQuestions.map((q) => q.title));

      const bankQuestions: BankQuestion[] = generatedQuestions.map((q) => ({
        id: `gen_${s.domainName.toLowerCase().replace(/\s+/g, "_")}_${q.id}_${Date.now()}`,
        title: q.title,
        description: q.description || q.explanation || `Question for ${s.domainName}`,
        domain: s.domainName,
        difficulty: (s.difficulty === "Easy" ? "Beginner" : s.difficulty === "Difficult" ? "Advanced" : "Intermediate") as any,
        estimatedTime: `${q.timeLimit || 5} mins`,
        type: q.type as any,
        starterCode: q.starterCode,
        language: q.language,
        referenceSolution: q.explanation || q.referenceAnswer,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
      }));
      saveQuestionsToBank(bankQuestions);

      const updated = updateSessionRecord(s.id, {
        status: "ready",
        questions: generatedQuestions,
        currentQuestionIndex: 0,
      });

      if (updated) {
        setSession(updated);
        setCurrentIndex(0);
        initQuestionIndex(updated, 0);
        setLoadingQuestions(false);
        toast.success("10 questions generated & ready!");
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Generation failed";
      updateSessionRecord(s.id, { status: "error", errorMessage: errMsg });
      toast.error("Failed to generate questions. Click 'Try Again' to retry.");
      setLoadingQuestions(false);
    }
  };

  // Coding solution state
  const [submitting, setSubmitting] = useState(false);
  const [solutionText, setSolutionText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("python");
  const [timeLeft, setTimeLeft] = useState(600);
  const [timerRunning, setTimerRunning] = useState(false);

  // User stats & submissions
  const [stats, setStats] = useState(() => calculateUserStats(userId));

  // Evaluation & AI Feedback state for active coding question
  const [evaluation, setEvaluation] = useState<{
    scores: ScoreBreakdown;
    feedback: FeedbackItem[];
  } | null>(null);

  const questions = Array.isArray(session?.questions) ? session.questions : [];

  // Background 10-question generation lifecycle
  useEffect(() => {
    if (!session) return;

    if (session.status === "generating" || questions.length === 0) {
      void runBackgroundGeneration();
    } else if (session.status === "ready" && questions.length > 0) {
      initQuestionIndex(session, currentIndex);
    }
  }, [sessionId]);

  // Track active evaluation request to guard against race conditions / late in-flight responses
  const activeRequestIdRef = useRef<number>(0);

  const initQuestionIndex = (currentSession: PracticeSession, index: number) => {
    // Invalidate any in-flight evaluation request from previous question
    activeRequestIdRef.current += 1;

    const qList = Array.isArray(currentSession?.questions) ? currentSession.questions : [];
    if (index >= qList.length) return;

    const q = qList[index];
    if (q && (q.type === "coding" || q.type === "theory")) {
      const initialLang = q.language || "python";
      setSelectedLanguage(initialLang);
      setSolutionText(
        getDraftCode(userId, `${currentSession.id}_q${index}`) || q.starterCode || ""
      );
      setTimeLeft((q.timeLimit || 10) * 60);
      setTimerRunning(true);
      setEvaluation(null);
    }
  };

  const runBackgroundGeneration = async () => {
    if (!session) return;

    console.log("[Pipeline Debug] Starting Question Generation:", {
      sessionId: session.id,
      branchName: session.branchName,
      domainName: session.domainName,
      difficulty: session.difficulty,
    });

    try {
      const recentlySeen = getRecentlySeenTitles();
      const generatedQuestions = await generateGroqQuestions(
        session.branchName,
        session.domainName,
        session.difficulty,
        recentlySeen
      );

      recordRecentlySeenTitles(generatedQuestions.map((q) => q.title));

      // Persist generated questions to Practice Question Bank store
      const bankQuestions: BankQuestion[] = generatedQuestions.map((q) => ({
        id: `gen_${session.domainName.toLowerCase().replace(/\s+/g, "_")}_${q.id}_${Date.now()}`,
        title: q.title,
        description: q.description || q.explanation || `Question for ${session.domainName}`,
        domain: session.domainName,
        difficulty: (session.difficulty === "Easy" ? "Beginner" : session.difficulty === "Difficult" ? "Advanced" : "Intermediate") as any,
        estimatedTime: `${q.timeLimit || 5} mins`,
        type: q.type as any,
        starterCode: q.starterCode,
        language: q.language,
        referenceSolution: q.explanation || q.referenceAnswer,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
      }));
      saveQuestionsToBank(bankQuestions);

      const updated = updateSessionRecord(session.id, {
        status: "ready",
        questions: generatedQuestions,
        currentQuestionIndex: 0,
      });

      if (updated) {
        setSession(updated);
        setCurrentIndex(0);
        initQuestionIndex(updated, 0);
        toast.success("10 questions generated & ready!");
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Generation failed";
      const updated = updateSessionRecord(session.id, {
        status: "error",
        errorMessage: errMsg,
      });
      if (updated) setSession(updated);
      toast.error("Failed to generate questions. Click 'Try Again' to retry.");
    }
  };

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

  // Autosave code on change
  useEffect(() => {
    if (session?.status === "ready" && currentIndex >= 8 && currentIndex < 10) {
      saveDraftCode(userId, `${session.id}_q${currentIndex}`, solutionText);
    }
  }, [solutionText, session?.id, currentIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // MCQ Answer Submission Handler
  const handleMCQAnswerSubmit = (selectedIndex: number, isCorrect: boolean) => {
    if (!session || questions.length <= currentIndex) return;

    const currentQ = questions[currentIndex];
    const updatedAnswers = { ...(session.mcqAnswers || {}), [currentQ.id]: selectedIndex };
    const updatedScore = (session.mcqScore || 0) + (isCorrect ? 1 : 0);

    const updatedSession = updateSessionRecord(session.id, {
      mcqAnswers: updatedAnswers,
      mcqScore: updatedScore,
    });

    if (updatedSession) setSession(updatedSession);
  };

  // Move to Next Question
  const handleNextQuestion = () => {
    if (!session) return;

    // Auto-evaluate / record score for coding/theory question if solutionText was typed
    const currentQ = questions[currentIndex];
    if (currentQ && (currentQ.type === "coding" || currentQ.type === "theory") && solutionText.trim()) {
      const currentCodingScores = session.codingScores || {};
      if (currentCodingScores[currentIndex] === undefined) {
        const isMeaningful = solutionText.trim().length > 15;
        const autoScore = isMeaningful ? 80 : 40;
        const updatedCodingScores = { ...currentCodingScores, [currentIndex]: autoScore };
        const scoreValues = Object.values(updatedCodingScores);
        const averageCodingScore = Math.round(
          scoreValues.reduce((sum, s) => sum + s, 0) / scoreValues.length
        );
        updateSessionRecord(session.id, {
          codingScores: updatedCodingScores,
          codingScore: averageCodingScore,
        });
      }
    }

    const nextIdx = currentIndex + 1;

    if (nextIdx >= questions.length) {
      const updatedSession = updateSessionRecord(session.id, {
        status: "completed",
        currentQuestionIndex: nextIdx,
      });
      if (updatedSession) setSession(updatedSession);
      toast.success("Congratulations! Session completed.");
      return;
    }

    setCurrentIndex(nextIdx);
    updateSessionRecord(session.id, { currentQuestionIndex: nextIdx });
    initQuestionIndex(session, nextIdx);
  };

  // Submit Solution for Grok AI Evaluation (Coding/Theory)
  const handleSubmitCodingSolution = async () => {
    if (!session || !solutionText.trim() || questions.length <= currentIndex) {
      toast.error("Please write your solution before submitting!");
      return;
    }

    // Increment request ID to guard against late in-flight responses
    activeRequestIdRef.current += 1;
    const requestId = activeRequestIdRef.current;

    const currentQ = questions[currentIndex];
    setSubmitting(true);
    toast.info("Evaluating your solution with InterviewMate AI...");

    try {
      const res = await evaluateCodeSubmission(
        currentQ.title,
        currentQ.description,
        currentQ.referenceAnswer || "",
        solutionText,
        session.difficulty,
        selectedLanguage
      );

      // Guard: Discard late response if user switched questions while request was in-flight
      if (activeRequestIdRef.current !== requestId) {
        console.log("[Race Condition Guard] Ignored late evaluation response from previous question.");
        return;
      }

      const scoreBreakdown: ScoreBreakdown = {
        correctness: res.correctness,
        efficiency: res.efficiency,
        codeQuality: res.codeQuality,
        testCases: res.testCases,
        overallScore: res.overallScore,
      };

      setEvaluation({
        scores: scoreBreakdown,
        feedback: res.feedback,
      });

      const newSubmission: Submission = {
        id: `sub_${Date.now()}`,
        userId,
        challengeId: `${session.id}_q${currentIndex}`,
        code: solutionText,
        scores: scoreBreakdown,
        feedback: res.feedback,
        timeSpentSeconds: (currentQ.timeLimit || 10) * 60 - timeLeft,
        createdAt: new Date().toISOString(),
      };

      saveUserSubmission(userId, newSubmission);
      setStats(calculateUserStats(userId));

      const currentCodingScores = session.codingScores || {};
      const updatedCodingScores = { ...currentCodingScores, [currentIndex]: res.overallScore };
      const scoreValues = Object.values(updatedCodingScores);
      const averageCodingScore = Math.round(
        scoreValues.reduce((sum, s) => sum + s, 0) / scoreValues.length
      );

      const updatedSession = updateSessionRecord(session.id, {
        codingScores: updatedCodingScores,
        codingScore: averageCodingScore,
      });

      if (updatedSession) {
        setSession(updatedSession);
      }

      toast.success(`Solution evaluated! Score: ${res.overallScore}/100`);
    } catch {
      if (activeRequestIdRef.current === requestId) {
        toast.error("AI evaluation failed.");
      }
    } finally {
      if (activeRequestIdRef.current === requestId) {
        setSubmitting(false);
      }
    }
  };

  const handleAutoSubmit = async () => {
    toast.warning("Time limit expired! Auto-submitting solution...");
    setTimerRunning(false);
    await handleSubmitCodingSolution();
  };

  // If Session Record Not Found
  if (!session) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-4 max-w-md mx-auto my-12">
        <AlertTriangle className="size-10 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Session Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested session ID does not exist or has expired.
        </p>
        <Button
          onClick={() => void navigate({ to: "/user/dashboard" })}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // 1. GENERATING / LOADING SCREEN
  if (session.status === "generating" && questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[75vh] p-4">
        <div className="w-full max-w-lg text-center space-y-6 p-8 rounded-3xl bg-slate-900/90 border border-teal-500/20 backdrop-blur-2xl shadow-2xl shadow-teal-950/40">
          <div className="relative size-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-teal-500/20 border-t-teal-400 animate-spin" />
            <div className="size-full rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/30">
              <BrainCircuit className="size-8 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <Sparkles className="size-3.5" />
              <span>Generating AI Assessment</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Preparing your 10-question practice set...
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              InterviewMate AI is calibrating 8 MCQs + 2 Coding/Theory questions for {session.domainName}.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-center gap-2">
            <Bot className="size-4 text-teal-400" />
            <span>This can take a few seconds while InterviewMate AI writes your questions.</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. ERROR STATE
  if (session.status === "error") {
    return (
      <div className="flex items-center justify-center min-h-[75vh] p-4">
        <div className="w-full max-w-md text-center space-y-6 p-8 rounded-3xl bg-slate-900/90 border border-red-500/30 backdrop-blur-2xl shadow-2xl">
          <div className="size-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="size-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Generation Failed</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {session.errorMessage || "Could not generate questions via AI service."}
            </p>
          </div>

          <Button
            onClick={() => void navigate({ to: "/user/dashboard" })}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs py-3 rounded-xl"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // 3. COMPLETED SESSION SUMMARY SCREEN
  if (session.status === "completed") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-teal-500/20 backdrop-blur-2xl shadow-2xl text-center space-y-6">
          <div className="size-20 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/30">
            <Trophy className="size-10 text-teal-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Session Completed! 🎉
            </h1>
            <p className="text-xs text-slate-400">
              Great job completing your 10-question evaluation in {session.domainName}.
            </p>
          </div>

          {/* Scores breakdown grid */}
          {(() => {
            const hasTheoryQ = questions.some((q) => q.type === "theory") || !isTechSoftwareDomain(session.branchName, session.domainName);
            const scoreLabel = hasTheoryQ ? "Theory Score" : "Coding Score";

            const rawMcqCount = session.mcqScore ?? 0;
            const mcqPercentage = Math.min(100, Math.round((rawMcqCount / 8) * 100));
            const codingScoreVal = session.codingScore ?? 0;
            const earnedXP = Math.round((mcqPercentage * 1.5) + (codingScoreVal * 1.0));

            return (
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">MCQ Score</span>
                  <p className="text-2xl font-bold text-teal-400">
                    {mcqPercentage}%
                  </p>
                  <p className="text-[10px] text-slate-500">{rawMcqCount}/8 Correct</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">{scoreLabel}</span>
                  <p className="text-2xl font-bold text-cyan-400">
                    {codingScoreVal}/100
                  </p>
                  <p className="text-[10px] text-slate-500">Evaluated by InterviewMate AI</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Points Earned</span>
                  <p className="text-2xl font-bold text-amber-400">+{earnedXP} XP</p>
                  <p className="text-[10px] text-slate-500">🔥 {stats.streakCount} Day Streak</p>
                </div>
              </div>
            );
          })()}

          <Button
            onClick={() => void navigate({ to: "/user/dashboard" })}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold py-6 text-sm rounded-xl gap-2 shadow-lg shadow-teal-500/20"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  // 4. ACTIVE QUESTION SCREEN (Questions 1 to 10)
  const currentQ = questions[currentIndex];
  if (!currentQ) {
    if (questions.length > 0 && currentIndex >= questions.length) {
      const updatedSession = updateSessionRecord(session.id, { status: "completed" });
      if (updatedSession) setSession(updatedSession);
      return null;
    }
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto my-12 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <AlertTriangle className="size-8 text-amber-400 mx-auto" />
        <p className="text-sm font-semibold text-white">Question data is currently unavailable.</p>
        <Button
          onClick={() => void navigate({ to: "/user/dashboard" })}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const progressPercent = ((currentIndex + 1) / 10) * 100;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Progress Stepper */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void navigate({ to: "/user/dashboard" })}
            className="border-slate-800 text-slate-400 hover:text-white text-xs gap-1.5 rounded-xl"
          >
            <ArrowLeft className="size-3.5" /> Dashboard
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-400">
                Question {currentIndex + 1} of 10
              </span>
              <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-[10px]">
                {currentQ.type === "mcq" ? "Multiple Choice" : currentQ.type === "coding" ? "Coding" : "Conceptual Theory"}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {session.domainName} • {session.difficulty}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3 w-full md:w-64">
          <div className="h-2 flex-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-300">{Math.round(progressPercent)}%</span>
        </div>
      </div>

      {/* RENDER QUESTION UI */}
      {currentQ.type === "theory" || session.domainId.includes("mock") || session.domainName.toLowerCase().includes("mock") ? (
        <ConversationalMockCard
          key={currentQ.id || currentIndex}
          question={currentQ}
          questionIndex={currentIndex}
          totalQuestions={10}
          domainName={session.domainName}
          difficulty={session.difficulty}
          onAnswerEvaluated={(score, userText) => {
            handleCodingEvaluated({
              correctness: score,
              efficiency: score,
              codeQuality: score,
              testCases: 100,
              overallScore: score,
              feedback: [{ type: "strength", text: `Evaluated response: ${userText.slice(0, 50)}...` }],
            });
          }}
          onNextQuestion={handleNextQuestion}
        />
      ) : currentQ.type === "mcq" ? (
        // QUESTIONS 1-8: MCQ QUESTION CARD
        <MCQQuestionCard
          key={currentQ.id || currentIndex}
          question={currentQ}
          questionNumber={currentIndex + 1}
          totalQuestions={10}
          onAnswerSubmit={handleMCQAnswerSubmit}
          onNext={handleNextQuestion}
        />
      ) : (
        // QUESTIONS 9-10: CODING / THEORY EDITOR (NO CHATBOT IN EXAM)
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
                    {currentQ.type === "coding" ? <Code2 className="size-4" /> : <FileText className="size-4" />}
                  </div>
                  <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                    {currentQ.type === "coding" ? "Coding Challenge" : "Technical Conceptual Challenge"}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">{currentQ.title}</h2>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed font-sans">{currentQ.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Timer className="size-3.5 text-teal-400" />
                  <span>⏱ {formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>

            {/* Solution Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="text-teal-400 font-semibold uppercase">
                  {currentQ.type === "coding" ? "Code Editor" : "Written Response"}
                </span>
              </div>

              {currentQ.type === "coding" ? (
                <CodeEditor
                  value={solutionText}
                  onChange={setSolutionText}
                  language={selectedLanguage}
                  onLanguageChange={(newLang, newCode) => {
                    setSelectedLanguage(newLang);
                    setSolutionText(newCode);
                    saveDraftCode(userId, `${session.id}_q${currentIndex}`, newCode);
                  }}
                  questionTitle={currentQ.title}
                  baseStarterCode={currentQ.starterCode}
                />
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <Textarea
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    placeholder="Write your technical explanation, formula derivations, or architectural reasoning here..."
                    className="min-h-[280px] bg-transparent border-none text-xs text-slate-200 placeholder:text-slate-500 focus-visible:ring-0 resize-none font-sans leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSolutionText("")}
                className="border-slate-800 text-slate-400 hover:text-white text-xs gap-1.5"
              >
                <RotateCcw className="size-3.5" /> Clear Response
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSubmitCodingSolution}
                  disabled={submitting}
                  className="bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-teal-500/20 gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Evaluating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" /> Evaluate with InterviewMate AI
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleNextQuestion}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl gap-2"
                >
                  <span>Next Question</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* AI Evaluation Scores Card (Rendered when evaluated) */}
          {evaluation && (
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-teal-400" />
                  <h3 className="text-sm font-semibold text-white">AI Evaluation & Feedback</h3>
                </div>
                <span className="text-lg font-bold text-teal-400">{evaluation.scores.overallScore}/100</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Correctness</span>
                  <p className="text-base font-bold text-teal-400">{evaluation.scores.correctness}/100</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Efficiency</span>
                  <p className="text-base font-bold text-cyan-400">{evaluation.scores.efficiency}/100</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Code Quality</span>
                  <p className="text-base font-bold text-emerald-400">{evaluation.scores.codeQuality}/100</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Test Cases</span>
                  <p className="text-base font-bold text-amber-400">{evaluation.scores.testCases}/100</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {evaluation.feedback.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
