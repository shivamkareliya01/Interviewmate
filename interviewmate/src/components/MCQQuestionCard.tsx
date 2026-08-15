import { useState, useEffect } from "react";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type GroqQuestion } from "@/lib/groq";

interface MCQQuestionCardProps {
  question: GroqQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSubmit: (selectedIndex: number, isCorrect: boolean) => void;
  onNext: () => void;
}

export function MCQQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswerSubmit,
  onNext,
}: MCQQuestionCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Reset local state whenever question changes
  useEffect(() => {
    setSelectedIndex(null);
    setSubmitted(false);
  }, [question.id, questionNumber]);

  const options = question.options || [
    "Option A",
    "Option B",
    "Option C",
    "Option D",
  ];
  const correctIndex = question.correctAnswerIndex ?? 0;
  const isCorrect = selectedIndex === correctIndex;

  const handleSelectOption = (index: number) => {
    if (submitted) return;
    setSelectedIndex(index);
    const isThisCorrect = index === correctIndex;
    onAnswerSubmit(index, isThisCorrect);
  };

  const handleSubmit = () => {
    if (selectedIndex === null || submitted) return;
    setSubmitted(true);
    const isThisCorrect = selectedIndex === correctIndex;
    onAnswerSubmit(selectedIndex, isThisCorrect);
  };

  return (
    <div className="space-y-6">
      {/* MCQ Card Container */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Top Header & Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
                <HelpCircle className="size-4" />
              </div>
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                Multiple Choice Question ({questionNumber} of {totalQuestions})
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {question.title}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                question.difficulty === "easy"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                  : question.difficulty === "moderate"
                  ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}
            >
              {question.difficulty.toUpperCase()}
            </span>
            {question.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-slate-800 text-teal-300 border-slate-700 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Question Prompt Description */}
        <p className="text-sm md:text-base text-slate-200 leading-relaxed font-sans font-medium">
          {question.description}
        </p>

        {/* 4 Selectable Option Cards */}
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((opt, index) => {
            const isSelected = selectedIndex === index;
            const isThisCorrect = index === correctIndex;

            let cardStyle = "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60 text-slate-200";

            if (submitted) {
              if (isThisCorrect) {
                cardStyle = "bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400 font-semibold";
              } else if (isSelected && !isThisCorrect) {
                cardStyle = "bg-rose-500/20 border-rose-400 text-rose-200 ring-1 ring-rose-400 font-semibold";
              } else {
                cardStyle = "bg-slate-950/40 border-slate-900 text-slate-500 opacity-60";
              }
            } else if (isSelected) {
              cardStyle = "bg-gradient-to-r from-teal-500/20 to-cyan-500/10 border-teal-400 text-white ring-1 ring-teal-400 shadow-lg shadow-teal-500/10";
            }

            const letter = String.fromCharCode(65 + index); // A, B, C, D

            return (
              <div
                key={index}
                onClick={() => handleSelectOption(index)}
                className={`p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 cursor-pointer ${cardStyle}`}
              >
                <div
                  className={`size-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                    submitted && isThisCorrect
                      ? "bg-emerald-500 text-slate-950"
                      : submitted && isSelected && !isThisCorrect
                      ? "bg-rose-500 text-slate-950"
                      : isSelected
                      ? "bg-teal-500 text-slate-950"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {letter}
                </div>
                <span className="text-xs md:text-sm leading-snug pt-0.5">{opt}</span>
              </div>
            );
          })}
        </div>

        {/* AI Feedback & Explanation Panel (after submission) */}
        {submitted && (
          <div className="p-4 md:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="size-5" />
                  <span>Correct Answer! Well done!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <XCircle className="size-5" />
                  <span>Wrong Answer. Correct choice is Option {String.fromCharCode(65 + correctIndex)}: {options[correctIndex]}</span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <Lightbulb className="size-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-teal-400 block mb-0.5">AI Explanation:</span>
                <p className="leading-relaxed">{question.explanation || `Option ${String.fromCharCode(65 + correctIndex)} is the correct answer.`}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-500 font-medium">
            {submitted ? "Answer recorded" : "Select an option to proceed"}
          </span>

          {!submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedIndex === null}
              className="bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-teal-500/20 gap-2"
            >
              <Sparkles className="size-4" /> Submit Answer
            </Button>
          ) : (
            <Button
              onClick={onNext}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl gap-2 shadow-lg shadow-teal-500/20"
            >
              <span>Next Question</span>
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
