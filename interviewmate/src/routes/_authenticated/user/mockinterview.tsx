import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Sparkles, Bot, SlidersHorizontal, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DesktopGate } from "@/components/DesktopGate";
import { SelectionWizard } from "@/components/SelectionWizard";
import { type SessionConfig } from "@/lib/branches";
import { createSessionRecord } from "@/lib/sessionStore";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/user/mockinterview")({
  head: () => ({
    meta: [{ title: "AI Mock Interview | InterviewMate" }],
  }),
  component: MockInterviewPageWrapper,
});

function MockInterviewPageWrapper() {
  return (
    <DesktopGate>
      <MockInterviewPage />
    </DesktopGate>
  );
}

function MockInterviewPage() {
  const navigate = useNavigate();
  const [domain, setDomain] = useState("React");
  const [difficulty, setDifficulty] = useState("Moderate");
  const [loading, setLoading] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  const launchSession = (domainName: string, diff: string, branchIdStr: string = "cs", branchNameStr: string = "Computer Science") => {
    setLoading(true);
    try {
      const session = createSessionRecord({
        userId: "guest_user",
        branchId: branchIdStr,
        branchName: branchNameStr,
        domainId: domainName.toLowerCase().replace(/\s+/g, "_"),
        domainName: domainName,
        difficulty: diff === "Hard" ? "Difficult" : diff === "Easy" ? "Easy" : "Moderate",
      });
      toast.success(`Launching AI Mock Interview Room for ${domainName} (${diff})...`);
      void navigate({ to: "/user/session/$sessionId", params: { sessionId: session.id } });
    } catch {
      toast.error("Failed to start mock interview session.");
    } finally {
      setLoading(false);
    }
  };

  const handleWizardComplete = (config: SessionConfig) => {
    setDomain(config.domainName);
    setDifficulty(config.difficulty);
    launchSession(config.domainName, config.difficulty, config.branchId, config.branchName);
  };

  const handleStartInterview = () => {
    // Map domain to branch
    let bId = "cs";
    let bName = "Computer Science";
    const dLower = domain.toLowerCase();
    if (dLower.includes("civil")) {
      bId = "civil";
      bName = "Civil Engineering";
    } else if (dLower.includes("chemical") || dLower.includes("process")) {
      bId = "chem";
      bName = "Chemical Engineering";
    } else if (dLower.includes("mechanical")) {
      bId = "mech";
      bName = "Mechanical Engineering";
    } else if (dLower.includes("finance") || dLower.includes("accounting")) {
      bId = "mgmt";
      bName = "Finance & Commerce";
    }
    launchSession(domain, difficulty, bId, bName);
  };

  return (
    <div className="space-y-6">
      <SelectionWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={handleWizardComplete}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mic className="size-6 text-teal-400" />
            AI Mock Interview Room
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulate real timed technical interviews evaluated live by InterviewMate AI.
          </p>
        </div>

        <Button
          onClick={() => setWizardOpen(true)}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl gap-2 shadow-lg shadow-teal-500/20"
        >
          <SlidersHorizontal className="size-4" />
          3-Step Selection Wizard
        </Button>
      </div>

        <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6 max-w-xl mx-auto text-center shadow-xl">
          <div className="size-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/30">
            <Bot className="size-6" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">Start a New Mock Interview</h2>
            <p className="text-xs text-slate-400 mt-1">
              Pick your technical topic & difficulty level. InterviewMate AI will launch a live interactive session with timed evaluation.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Select Domain</label>
              <div className="flex flex-wrap gap-2">
                {["React", "Node.js", "Python", "SQL", "JavaScript", "System Design"].map((d) => (
                  <Button
                    key={d}
                    size="sm"
                    variant={domain === d ? "default" : "outline"}
                    onClick={() => setDomain(d)}
                    className={
                      domain === d
                        ? "bg-teal-500 text-slate-950 font-bold"
                        : "border-slate-800 text-slate-300 hover:text-white"
                    }
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Difficulty</label>
              <div className="flex gap-2">
                {["Easy", "Moderate", "Hard"].map((df) => (
                  <Button
                    key={df}
                    size="sm"
                    variant={difficulty === df ? "default" : "outline"}
                    onClick={() => setDifficulty(df)}
                    className={
                      difficulty === df
                        ? "bg-teal-500 text-slate-950 font-bold"
                        : "border-slate-800 text-slate-300 hover:text-white"
                    }
                  >
                    {df}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleStartInterview}
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold py-6 text-sm rounded-xl gap-2 shadow-lg shadow-teal-500/20"
          >
            <Play className="size-4 fill-current" />
            {loading ? "Launching Interview Room..." : "Begin Mock Interview"}
          </Button>
        </div>
      </div>
  );
}
