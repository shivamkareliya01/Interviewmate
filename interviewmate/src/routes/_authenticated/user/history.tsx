import { createFileRoute } from "@tanstack/react-router";
import { History, Calendar, Award, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/user/history")({
  head: () => ({ meta: [{ title: "Session History | InterviewMate" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <History className="size-6 text-teal-400" />
          Interview Session History
        </h1>
        <p className="text-sm text-slate-400 mt-1">Review your past mock interview scores and feedback.</p>
      </div>

      <div className="space-y-3">
        {[
          { domain: "React", difficulty: "Intermediate", score: 85, date: "Aug 11, 2026", questions: 5 },
          { domain: "System Design", difficulty: "Advanced", score: 92, date: "Aug 09, 2026", questions: 5 },
          { domain: "Python", difficulty: "Beginner", score: 78, date: "Aug 05, 2026", questions: 5 },
        ].map((session, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold">
                {session.score}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{session.domain} Mock Interview</h3>
                <p className="text-xs text-slate-400">{session.difficulty} • {session.questions} Questions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Calendar className="size-3.5" /> {session.date}</span>
              <Badge variant="outline" className="border-teal-500/30 text-teal-300">Completed</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
