import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import { Code2, Play, Bookmark, SlidersHorizontal, SearchX, Sparkles, Layers, ChevronDown, Search, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DesktopGate } from "@/components/DesktopGate";
import { SelectionWizard } from "@/components/SelectionWizard";
import { BRANCHES, DOMAINS_BY_BRANCH, type SessionConfig } from "@/lib/branches";
import { getAllBankQuestions, type BankQuestion } from "@/lib/questionBank";
import { getBookmarkedIds, toggleBookmark } from "@/lib/bookmarkStore";
import { createSessionRecord, updateSessionRecord } from "@/lib/sessionStore";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/user/practice")({
  head: () => ({
    meta: [{ title: "Practice Mode | InterviewMate" }],
  }),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      branch: (search.branch as string) || "All",
      domain: (search.domain as string) || "All",
      difficulty: (search.difficulty as string) || "All",
    };
  },
  component: PracticePageWrapper,
});

function PracticePageWrapper() {
  return (
    <DesktopGate>
      <PracticePage />
    </DesktopGate>
  );
}

function PracticePage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_authenticated/user/practice" });

  const [selectedBranch, setSelectedBranch] = useState<string>(search.branch || "All");
  const [selectedDomain, setSelectedDomain] = useState<string>(search.domain || "All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(search.difficulty || "All");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [allQuestions, setAllQuestions] = useState<BankQuestion[]>([]);

  // Domain dropdown popover state
  const [domainDropdownOpen, setDomainDropdownOpen] = useState(false);
  const [domainSearchQuery, setDomainSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBookmarkedIds(getBookmarkedIds());
    setAllQuestions(getAllBankQuestions());
  }, []);

  // Close domain dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDomainDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Synchronize state with URL search params
  const updateUrlSearch = (newBranch: string, newDomain: string, newDiff: string) => {
    navigate({
      search: () => ({ branch: newBranch, domain: newDomain, difficulty: newDiff }),
      replace: true,
    });
  };

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranch(branchId);
    setSelectedDomain("All");
    updateUrlSearch(branchId, "All", selectedDifficulty);
  };

  const handleDomainSelect = (domainName: string) => {
    setSelectedDomain(domainName);
    setDomainDropdownOpen(false);
    setDomainSearchQuery("");
    updateUrlSearch(selectedBranch, domainName, selectedDifficulty);
  };

  const handleDifficultySelect = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    updateUrlSearch(selectedBranch, selectedDomain, difficulty);
  };

  // Compute domain list dynamically based on selected branch
  const availableDomains = useMemo(() => {
    if (selectedBranch === "All") {
      const all: string[] = ["All"];
      Object.values(DOMAINS_BY_BRANCH).forEach((domList) => {
        domList.forEach((d) => {
          if (!all.includes(d.name)) all.push(d.name);
        });
      });
      return all;
    }

    const branchDomains = DOMAINS_BY_BRANCH[selectedBranch] || [];
    return ["All", ...branchDomains.map((d) => d.name)];
  }, [selectedBranch]);

  // Filter available domains based on live user search query
  const filteredDomainsForDropdown = useMemo(() => {
    if (!domainSearchQuery.trim()) return availableDomains;
    const query = domainSearchQuery.toLowerCase().trim();
    return availableDomains.filter(
      (d) => d !== "All" && d.toLowerCase().includes(query)
    );
  }, [availableDomains, domainSearchQuery]);

  const handleToggleBookmark = (questionId: string, title: string) => {
    const isNowBookmarked = toggleBookmark(questionId);
    setBookmarkedIds(getBookmarkedIds());
    if (isNowBookmarked) {
      toast.success(`Bookmarked "${title.slice(0, 30)}..."`);
    } else {
      toast.info(`Removed bookmark for "${title.slice(0, 30)}..."`);
    }
  };

  // Launch practice session for exact card question
  const handleStartPractice = (q: BankQuestion) => {
    const session = createSessionRecord({
      userId: "guest_user",
      branchId: selectedBranch !== "All" ? selectedBranch : "cs",
      branchName: selectedBranch !== "All" ? (BRANCHES.find((b) => b.id === selectedBranch)?.name || "Computer Science") : "Computer Science",
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

  // Launch dynamic AI session generation for empty state
  const handleGenerateAISession = () => {
    let targetBranch = BRANCHES.find((b) => b.id === selectedBranch);

    // If selectedBranch is "All", find the branch that owns selectedDomain
    if (!targetBranch && selectedDomain !== "All") {
      for (const [bId, domList] of Object.entries(DOMAINS_BY_BRANCH)) {
        if (domList.some((d) => d.name.toLowerCase() === selectedDomain.toLowerCase())) {
          targetBranch = BRANCHES.find((b) => b.id === bId);
          break;
        }
      }
    }

    const branchName = targetBranch ? targetBranch.name : "Engineering";
    const branchId = targetBranch ? targetBranch.id : "cs";
    const domainName = selectedDomain !== "All" ? selectedDomain : "General Fundamentals";
    const diffMapped = selectedDifficulty === "Beginner" ? "Easy" : selectedDifficulty === "Advanced" ? "Difficult" : "Moderate";

    const session = createSessionRecord({
      userId: "guest_user",
      branchId,
      branchName,
      domainId: domainName.toLowerCase().replace(/\s+/g, "_"),
      domainName,
      difficulty: diffMapped,
    });

    toast.success(`Generating tailored AI practice session for ${domainName}...`);
    navigate({ to: "/user/session/$sessionId", params: { sessionId: session.id } });
  };

  // Launch practice session from Branch & Domain Wizard
  const handleWizardComplete = (config: SessionConfig) => {
    setWizardOpen(false);
    const session = createSessionRecord({
      userId: "guest_user",
      branchId: config.branchId,
      branchName: config.branchName,
      domainId: config.domainId,
      domainName: config.domainName,
      difficulty: config.difficulty,
    });

    toast.success(`Launching tailored practice for ${config.domainName}...`);
    navigate({ to: "/user/session/$sessionId", params: { sessionId: session.id } });
  };

  // Filter question bank by branch, domain, and difficulty
  const filteredQuestions = (allQuestions.length > 0 ? allQuestions : getAllBankQuestions()).filter((q) => {
    const matchDomain = selectedDomain === "All" || q.domain.toLowerCase() === selectedDomain.toLowerCase();
    const matchDiff = selectedDifficulty === "All" || q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    return matchDomain && matchDiff;
  });

  const difficultiesList = ["All", "Beginner", "Intermediate", "Advanced"];

  // Group branches into Engineering vs Management & Non-Engineering
  const engBranches = BRANCHES.filter((b) => b.category === "Engineering");
  const mgmtBranches = BRANCHES.filter((b) => b.category === "Management & General");

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
            <Code2 className="size-6 text-teal-400" />
            Practice Mode Question Bank
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse self-paced technical interview questions across all engineering & management disciplines.
          </p>
        </div>

        <Button
          onClick={() => setWizardOpen(true)}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl gap-2 shadow-lg shadow-teal-500/20 shrink-0"
        >
          <SlidersHorizontal className="size-4" />
          Branch & Domain Wizard
        </Button>
      </div>

      {/* Sticky Compact Filter Bar */}
      <div className="sticky top-4 z-30 p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl shadow-2xl space-y-3.5">
        {/* Branch Filter Row with Category Separator */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Layers className="size-3.5 text-teal-400" />
            <span>Branch:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
            <Button
              size="sm"
              variant={selectedBranch === "All" ? "default" : "outline"}
              onClick={() => handleBranchSelect("All")}
              className={
                selectedBranch === "All"
                  ? "bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs py-0.5 h-7 px-2.5 rounded-lg"
                  : "border-slate-800 text-slate-400 hover:text-white text-xs py-0.5 h-7 px-2.5 rounded-lg"
              }
            >
              All Branches
            </Button>

            {/* Engineering Group */}
            {engBranches.map((b) => (
              <Button
                key={b.id}
                size="sm"
                variant={selectedBranch === b.id ? "default" : "outline"}
                onClick={() => handleBranchSelect(b.id)}
                className={
                  selectedBranch === b.id
                    ? "bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs py-0.5 h-7 px-2.5 rounded-lg"
                    : "border-slate-800 text-slate-400 hover:text-white text-xs py-0.5 h-7 px-2.5 rounded-lg"
                }
              >
                {b.code}
              </Button>
            ))}

            {/* Separator Divider */}
            <div className="h-4 w-[1px] bg-slate-700/80 mx-1 self-center hidden sm:block" />

            {/* Management & General Group */}
            {mgmtBranches.map((b) => (
              <Button
                key={b.id}
                size="sm"
                variant={selectedBranch === b.id ? "default" : "outline"}
                onClick={() => handleBranchSelect(b.id)}
                className={
                  selectedBranch === b.id
                    ? "bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs py-0.5 h-7 px-2.5 rounded-lg"
                    : "border-slate-800 text-slate-400 hover:text-white text-xs py-0.5 h-7 px-2.5 rounded-lg"
                }
              >
                {b.code}
              </Button>
            ))}
          </div>
        </div>

        {/* Domain Searchable Combobox Dropdown + Difficulty Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          {/* Domain Combobox Dropdown */}
          <div className="relative flex-1" ref={dropdownRef}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 shrink-0">Domain:</span>
              <div className="flex-1 flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDomainDropdownOpen((prev) => !prev)}
                  className="w-full sm:w-auto justify-between bg-slate-950/70 border-slate-800 text-slate-200 hover:text-white text-xs h-8 px-3 rounded-xl gap-2 font-medium"
                >
                  <span className="truncate max-w-[220px]">
                    {selectedDomain === "All"
                      ? `Domain (${availableDomains.length - 1} available)`
                      : selectedDomain}
                  </span>
                  <ChevronDown className="size-3.5 text-slate-400 shrink-0" />
                </Button>

                {selectedDomain !== "All" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDomainSelect("All")}
                    className="size-8 text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-xl"
                    title="Clear domain filter"
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Searchable Dropdown Overlay */}
            {domainDropdownOpen && (
              <div className="absolute left-0 top-10 z-50 w-full sm:w-80 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-2 space-y-2 max-h-80 flex flex-col">
                <div className="relative px-1 pt-1">
                  <Search className="absolute left-3 top-3.5 size-3.5 text-slate-400" />
                  <Input
                    type="text"
                    name="domain_search_input_nonce"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    value={domainSearchQuery}
                    onChange={(e) => setDomainSearchQuery(e.target.value)}
                    placeholder={`Search ${availableDomains.length - 1} domains...`}
                    className="pl-8 bg-slate-900 border-slate-800 text-xs h-8 rounded-xl text-white placeholder:text-slate-500 focus-visible:ring-teal-500/40"
                    autoFocus
                  />
                </div>

                <div className="overflow-y-auto flex-1 pr-1 space-y-1 scrollbar-thin">
                  {filteredDomainsForDropdown.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No matching domains found for "{domainSearchQuery}"
                    </div>
                  ) : (
                    filteredDomainsForDropdown.map((domainName) => {
                      const isSelected = selectedDomain === domainName;
                      return (
                        <button
                          key={domainName}
                          onClick={() => handleDomainSelect(domainName)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? "bg-teal-500/20 text-teal-300 font-semibold"
                              : "text-slate-300 hover:bg-slate-900 hover:text-white"
                          }`}
                        >
                          <span className="truncate">
                            {domainName === "All" ? "All Domains" : domainName}
                          </span>
                          {isSelected && <Check className="size-3.5 text-teal-400 shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Difficulty Filter Row */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-400">Difficulty:</span>
            <div className="flex items-center gap-1.5">
              {difficultiesList.map((diff) => (
                <Button
                  key={diff}
                  size="sm"
                  variant={selectedDifficulty === diff ? "default" : "ghost"}
                  onClick={() => handleDifficultySelect(diff)}
                  className={
                    selectedDifficulty === diff
                      ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs py-0.5 h-7 px-2.5 rounded-lg font-semibold"
                      : "text-slate-400 hover:text-white text-xs py-0.5 h-7 px-2 rounded-lg"
                  }
                >
                  {diff}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Question Cards Grid / Empty State */}
      {filteredQuestions.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-4">
          <SearchX className="size-10 text-slate-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">No questions found in local bank</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              No questions for domain <span className="text-teal-400 font-medium">"{selectedDomain}"</span> ({selectedDifficulty}). You can generate a fresh 10-question AI practice session right now!
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                handleBranchSelect("All");
                handleDomainSelect("All");
                handleDifficultySelect("All");
              }}
              className="border-slate-700 text-slate-300 hover:text-white"
            >
              Reset Filters
            </Button>
            <Button
              size="sm"
              onClick={handleGenerateAISession}
              className="bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold gap-2"
            >
              <Sparkles className="size-4" /> Generate AI Practice Session
            </Button>
          </div>
        </div>
      ) : (
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
                    <div className="flex items-center gap-2">
                      <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30">
                        {q.domain}
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
      )}
    </div>
  );
}
