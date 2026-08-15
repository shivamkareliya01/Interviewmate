import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bookmark, Code2, Trash2, Play, BookmarkX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRACTICE_QUESTION_BANK, type BankQuestion } from "@/lib/questionBank";
import { getBookmarkedIds, toggleBookmark } from "@/lib/bookmarkStore";
import { createSessionRecord, updateSessionRecord } from "@/lib/sessionStore";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/user/bookmarks")({
  head: () => ({ meta: [{ title: "Saved Bookmarks | InterviewMate" }] }),
  component: BookmarksPage,
});

function BookmarksPage() {
  const navigate = useNavigate();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    setBookmarkedIds(getBookmarkedIds());
  }, []);

  const handleRemoveBookmark = (id: string, title: string) => {
    toggleBookmark(id);
    setBookmarkedIds(getBookmarkedIds());
    toast.info(`Removed bookmark for "${title.slice(0, 30)}..."`);
  };

  const handleStartPractice = (q: BankQuestion) => {
    const session = createSessionRecord({
      userId: "guest_user",
      branchId: "cs",
      branchName: "Computer Science",
      domainId: q.domain.toLowerCase().replace(/\s+/g, "_"),
      domainName: q.domain,
      difficulty: q.difficulty === "Beginner" ? "Easy" : q.difficulty === "Intermediate" ? "Moderate" : "Difficult",
    });

    const questionPayload = {
      id: 1,
      type: q.type,
      title: q.title,
      description: q.description,
      options: q.options || [],
      correctAnswerIndex: q.correctAnswerIndex ?? 0,
      explanation: q.referenceSolution || "Review solution guidelines.",
      difficulty: q.difficulty.toLowerCase(),
      timeLimit: parseInt(q.estimatedTime) || 5,
      starterCode: q.starterCode || (q.type === "coding" ? `def solution():\n    pass` : null),
      language: q.language || (q.type === "coding" ? "python" : null),
      referenceAnswer: q.referenceSolution || "",
      tags: [q.domain, q.difficulty],
    };

    updateSessionRecord(session.id, {
      status: "ready",
      questions: [questionPayload as any],
      currentQuestionIndex: 0,
    });

    toast.success(`Starting practice: ${q.title}`);
    navigate({ to: "/user/session/$sessionId", params: { sessionId: session.id } });
  };

  const bookmarkedQuestions = PRACTICE_QUESTION_BANK.filter((q) => bookmarkedIds.includes(q.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bookmark className="size-6 text-teal-400" />
          Bookmarked Questions
        </h1>
        <p className="text-sm text-slate-400 mt-1">Quick access to questions you saved for review.</p>
      </div>

      {bookmarkedQuestions.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
          <BookmarkX className="size-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-semibold text-white">No bookmarked questions</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You haven't saved any questions yet. Browse the Practice Bank to bookmark questions for quick review.
          </p>
          <Button
            size="sm"
            onClick={() => navigate({ to: "/user/practice" })}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs mt-2"
          >
            Browse Question Bank
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarkedQuestions.map((q) => (
            <div key={q.id} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Code2 className="size-5 text-teal-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30 text-[10px] py-0">
                      {q.domain}
                    </Badge>
                    <Badge variant="outline" className="text-slate-400 border-slate-800 text-[10px] py-0">
                      {q.difficulty}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-white">{q.title}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleStartPractice(q)}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold gap-1.5 text-xs"
                >
                  <Play className="size-3.5 fill-current" /> Practice
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveBookmark(q.id, q.title)}
                  className="text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
