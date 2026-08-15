import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, TrendingUp, Target, Award, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/user/analytics")({
  head: () => ({ meta: [{ title: "Performance Analytics | InterviewMate" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="size-6 text-teal-400" />
          Performance & Learning Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-1">Track your progress and readiness across domains.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Average Score", value: "85%", icon: TrendingUp, color: "text-teal-400" },
          { label: "Questions Solved", value: "24", icon: Target, color: "text-cyan-400" },
          { label: "Overall Accuracy", value: "91%", icon: Zap, color: "text-emerald-400" },
        ].map((stat) => (
          <div key={stat.label} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
              <stat.icon className={`size-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
