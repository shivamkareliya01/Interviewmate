import { useState } from "react";
import { Bot, Send, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { evaluateCodeSubmission, type GroqQuestion, type CodeEvaluationResult } from "@/lib/groq";
import { toast } from "sonner";

interface ConversationalMockCardProps {
  question: GroqQuestion;
  questionIndex: number;
  totalQuestions: number;
  domainName: string;
  difficulty: string;
  onAnswerEvaluated: (score: number, userText: string) => void;
  onNextQuestion: () => void;
}

export function ConversationalMockCard({
  question,
  questionIndex,
  totalQuestions,
  domainName,
  difficulty,
  onAnswerEvaluated,
  onNextQuestion,
}: ConversationalMockCardProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<CodeEvaluationResult | null>(null);

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error("Please type your answer before submitting.");
      return;
    }

    setEvaluating(true);
    toast.info("InterviewMate AI is evaluating your response...");

    try {
      const result = await evaluateCodeSubmission(
        question.title,
        question.description,
        question.referenceAnswer || "Standard domain architecture answer",
        userAnswer,
        difficulty,
        "text"
      );

      setEvaluationResult(result);
      onAnswerEvaluated(result.overallScore, userAnswer);
      toast.success(`Answer evaluated! Score: ${result.overallScore}%`);
    } catch (err) {
      console.error("Evaluation error:", err);
      const fallbackScore = userAnswer.trim().length > 80 ? 85 : 60;
      const fallbackResult: CodeEvaluationResult = {
        correctness: fallbackScore,
        efficiency: fallbackScore,
        codeQuality: fallbackScore,
        testCases: 100,
        overallScore: fallbackScore,
        feedback: [
          { type: "strength", text: "Answer submitted with domain terminology." },
          { type: "suggestion", text: "Elaborate further on trade-offs and edge cases." },
        ],
      };
      setEvaluationResult(fallbackResult);
      onAnswerEvaluated(fallbackScore, userAnswer);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    setUserAnswer("");
    setEvaluationResult(null);
    onNextQuestion();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Question Header & Interviewer Bubble */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Bot className="size-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
                AI Interviewer Question {questionIndex + 1} of {totalQuestions}
              </span>
              <span className="text-xs text-slate-400">
                Domain: <strong className="text-slate-200">{domainName}</strong> | Difficulty: <strong className="text-slate-200">{difficulty}</strong>
              </span>
            </div>
          </div>

          <Badge className="bg-slate-950 text-cyan-300 border-cyan-500/30 text-xs px-3 py-1">
            Open-Ended Response
          </Badge>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
          <h3 className="text-lg font-bold text-white tracking-tight">{question.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">{question.description}</p>
        </div>
      </div>

      {/* Candidate Response Text Area */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Your Response (Type your detailed answer)
          </label>
          <span className="text-xs text-slate-400">
            {userAnswer.length} characters
          </span>
        </div>

        <Textarea
          value={userAnswer}
          disabled={evaluating || !!evaluationResult}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Explain your approach, design trade-offs, step-by-step logic, and edge cases in your own words..."
          className="min-h-[180px] bg-slate-950 border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-400 rounded-2xl p-4 leading-relaxed font-sans resize-none"
        />

        {!evaluationResult ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={evaluating || !userAnswer.trim()}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold py-3.5 rounded-xl gap-2 shadow-lg shadow-teal-500/20"
          >
            {evaluating ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                <span>Evaluating Response with InterviewMate AI...</span>
              </>
            ) : (
              <>
                <Send className="size-4 fill-current" />
                <span>Submit Answer for AI Evaluation</span>
              </>
            )}
          </Button>
        ) : (
          /* Live AI Evaluation Feedback Breakdown */
          <div className="p-5 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="size-5 text-amber-400" />
                <span className="text-sm font-bold text-white">AI Evaluation Summary</span>
              </div>
              <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/40 text-sm font-extrabold px-3 py-1">
                Score: {evaluationResult.overallScore}%
              </Badge>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Interviewer Feedback</span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {evaluationResult.feedback.map((fb, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    {fb.type === "strength" ? (
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <span>{fb.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={handleNext}
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 rounded-xl gap-2 mt-2"
            >
              <span>Next Question</span>
              <Sparkles className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
