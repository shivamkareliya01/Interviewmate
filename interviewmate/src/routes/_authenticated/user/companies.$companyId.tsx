import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Building2, ArrowLeft, Play, Bookmark, SlidersHorizontal, Sparkles, CheckCircle2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DesktopGate } from "@/components/DesktopGate";
import { SEEDED_COMPANIES, getCompanyQuestions, type Company } from "@/lib/companyStore";
import { getSavedResume } from "@/lib/resumeStore";
import { getBookmarkedIds, toggleBookmark } from "@/lib/bookmarkStore";
import { createSessionRecord, updateSessionRecord } from "@/lib/sessionStore";
import { type BankQuestion } from "@/lib/questionBank";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/user/companies/$companyId")({
  head: ({ params }) => ({
    meta: [{ title: `${params.companyId.toUpperCase()} Interview Questions | InterviewMate` }],
  }),
  component: CompanyDetailPageWrapper,
});

function CompanyDetailPageWrapper() {
  return (
    <DesktopGate>
      <CompanyDetailPage />
    </DesktopGate>
  );
}

function CompanyDetailPage() {
  const { companyId } = Route.useParams();
  const navigate = useNavigate();

  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    setBookmarkedIds(getBookmarkedIds());
  }, []);

  const company = useMemo(() => {
    return (
      SEEDED_COMPANIES.find((c) => c.id.toLowerCase() === companyId.toLowerCase()) || {
        id: companyId,
        name: companyId.toUpperCase(),
        industry: "Big Tech",
        description: `Technical interview prep and placement question bank for ${companyId.toUpperCase()}.`,
        typicalRounds: ["Online Assessment", "Technical Interview 1", "Technical Interview 2", "HR & Managerial"],
        difficultyReputation: "rigorous",
      }
    );
  }, [companyId]);

  const companyQuestions = useMemo(() => {
    return getCompanyQuestions(company.id);
  }, [company.id]);

  const availableDomains = useMemo(() => {
    const doms = ["All"];
    companyQuestions.forEach((q) => {
      if (!doms.includes(q.domain)) doms.push(q.domain);
    });
    return doms;
  }, [companyQuestions]);

  const filteredQuestions = useMemo(() => {
    return companyQuestions.filter((q) => {
      const matchDomain = selectedDomain === "All" || q.domain.toLowerCase() === selectedDomain.toLowerCase();
      const matchDiff = selectedDifficulty === "All" || q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
      return matchDomain && matchDiff;
    });
  }, [companyQuestions, selectedDomain, selectedDifficulty]);

  const handleToggleBookmark = (questionId: string, title: string) => {
    const isNowBookmarked = toggleBookmark(questionId);
    setBookmarkedIds(getBookmarkedIds());
    if (isNowBookmarked) {
      toast.success(`Bookmarked "${title.slice(0, 30)}..."`);
    } else {
      toast.info(`Removed bookmark for "${title.slice(0, 30)}..."`);
    }
  };

  // Launch single-card practice session
  const handleStartPractice = (q: BankQuestion) => {
    const session = createSessionRecord({
      userId: "guest_user",
      branchId: "cs",
      branchName: `${company.name} Prep`,
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
      tags: [q.domain, company.name],
    };

    updateSessionRecord(session.id, {
      status: "ready",
      questions: [questionPayload as any],
      currentQuestionIndex: 0,
    });

    toast.success(`Starting ${company.name} practice: ${q.title}`);
    navigate({ to: "/user/session/$sessionId", params: { sessionId: session.id } });
  };

  // Launch Full Mock Interview for Company
  const handleStartFullCompanyMock = () => {
    const session = createSessionRecord({
      userId: "guest_user",
      branchId: "cs",
      branchName: `${company.name} Target Track`,
      domainId: `${company.id}_interview`,
      domainName: `${company.name} Full Interview Prep`,
      difficulty: company.difficultyReputation === "rigorous" ? "Difficult" : "Moderate",
    });

    toast.success(`Launching full 10-question evaluation for ${company.name}...`);
    navigate({ to: "/user/session/$sessionId", params: { sessionId: session.id } });
  };

  const difficultiesList = ["All", "Beginner", "Intermediate", "Advanced"];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Button & Company Header Card */}
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => void navigate({ to: "/user/companies" })}
          className="border-slate-800 text-slate-400 hover:text-white text-xs gap-1.5 rounded-xl"
        >
          <ArrowLeft className="size-3.5" /> Back to Company Directory
        </Button>

        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start md:items-center gap-4">
              <div className="size-16 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center font-bold text-teal-300 text-2xl shadow-lg shrink-0">
                {company.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {company.name}
                  </h1>
                  <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30 text-xs">
                    {company.industry}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      company.difficultyReputation === "rigorous"
                        ? "border-red-500/40 text-red-400 bg-red-500/10 text-xs"
                        : "border-amber-500/40 text-amber-300 bg-amber-500/10 text-xs"
                    }
                  >
                    {company.difficultyReputation === "rigorous" ? "Rigorous" : "Moderate"} Reputation
                  </Badge>
                  {getSavedResume() && (
                    <Badge variant="outline" className="border-teal-400/40 text-teal-300 bg-teal-500/10 text-xs gap-1">
                      <Sparkles className="size-3 text-teal-400" /> Resume Personalization Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {company.description}
                </p>
              </div>
            </div>

            <Button
              onClick={handleStartFullCompanyMock}
              className="bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold text-xs py-3 px-5 rounded-xl gap-2 shadow-lg shadow-teal-500/20 shrink-0"
            >
              <Sparkles className="size-4" /> Start Full Mock Interview for {company.name}
            </Button>
          </div>

          {/* Typical Process Stepper Cards */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="size-3.5 text-teal-400" /> Typical Recruitment Process ({company.typicalRounds.length} Rounds)
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {company.typicalRounds.map((roundName, rIdx) => (
                <div
                  key={rIdx}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-teal-400 text-[10px] font-bold">
                    <CheckCircle2 className="size-3" /> Round {rIdx + 1}
                  </div>
                  <p className="text-xs font-semibold text-white leading-tight">{roundName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Domain & Difficulty Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">Domain:</span>
          {availableDomains.map((d) => (
            <Button
              key={d}
              size="sm"
              variant={selectedDomain === d ? "default" : "outline"}
              onClick={() => setSelectedDomain(d)}
              className={
                selectedDomain === d
                  ? "bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs py-1 h-7 rounded-lg"
                  : "border-slate-800 text-slate-400 hover:text-white text-xs py-1 h-7 rounded-lg"
              }
            >
              {d}
            </Button>
          ))}

          <span className="text-xs font-semibold text-slate-400 ml-auto">Difficulty:</span>
          {difficultiesList.map((diff) => (
            <Button
              key={diff}
              size="sm"
              variant={selectedDifficulty === diff ? "default" : "ghost"}
              onClick={() => setSelectedDifficulty(diff)}
              className={
                selectedDifficulty === diff
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs py-1 h-7 rounded-lg"
                  : "text-slate-400 hover:text-white text-xs py-1 h-7 rounded-lg"
              }
            >
              {diff}
            </Button>
          ))}
        </div>
      </div>

      {/* Question Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredQuestions.map((q) => {
          const bookmarked = bookmarkedIds.includes(q.id);

          return (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/40 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30">
                      {q.domain}
                    </Badge>
                    <Badge variant="outline" className="border-teal-500/30 text-teal-300 bg-teal-500/5 text-[10px]">
                      {q.companyRound ? `${q.companyRound}` : `Asked at ${company.name}`}
                    </Badge>
                    <Badge variant="outline" className="text-slate-400 border-slate-800 text-[10px]">
                      {q.difficulty}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500">{q.estimatedTime}</span>
                </div>
                <h3 className="text-base font-semibold text-white leading-snug">{q.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{q.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleBookmark(q.id, q.title)}
                  className={
                    bookmarked
                      ? "text-teal-400 hover:text-teal-300 gap-1.5 text-xs font-semibold"
                      : "text-slate-400 hover:text-teal-400 gap-1.5 text-xs"
                  }
                >
                  <Bookmark className={`size-4 ${bookmarked ? "fill-teal-400" : ""}`} />
                  {bookmarked ? "Bookmarked" : "Bookmark"}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleStartPractice(q)}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold gap-1.5 text-xs"
                >
                  <Play className="size-3.5 fill-current" /> Start Practice
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
