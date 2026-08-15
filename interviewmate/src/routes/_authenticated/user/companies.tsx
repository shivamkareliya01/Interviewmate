import { createFileRoute, useNavigate, Outlet, useMatches } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { Building2, Search, ArrowRight, Layers, ChevronDown, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DesktopGate } from "@/components/DesktopGate";
import { BRANCHES } from "@/lib/branches";
import { SEEDED_COMPANIES, getCompanyQuestionCount, type Company } from "@/lib/companyStore";

export const Route = createFileRoute("/_authenticated/user/companies")({
  head: () => ({
    meta: [{ title: "Company Interview Directory | InterviewMate" }],
  }),
  component: CompaniesPageWrapper,
});

function CompaniesPageWrapper() {
  const matches = useMatches();
  const isChildActive = matches.some(
    (m) => m.routeId === "/_authenticated/user/companies/$companyId"
  );

  if (isChildActive) {
    return <Outlet />;
  }

  return (
    <DesktopGate>
      <CompaniesPage />
    </DesktopGate>
  );
}

function CompaniesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("All");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All");

  // Industry dropdown popover state
  const [industryDropdownOpen, setIndustryDropdownOpen] = useState(false);
  const [industrySearchQuery, setIndustrySearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close industry dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIndustryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const industriesList = [
    "All",
    "Big Tech",
    "IT Services & Consulting",
    "Core Engineering & Manufacturing",
    "Electronics & Semiconductors",
    "Civil & Infrastructure",
    "Chemical & Energy",
    "Biotech & Pharma",
    "Agriculture & AgTech",
    "Management & Consulting",
    "Commerce, Banking & Finance",
    "E-Commerce & Delivery",
    "Fintech & Payments",
  ];

  const engBranches = BRANCHES.filter((b) => b.category === "Engineering");
  const mgmtBranches = BRANCHES.filter((b) => b.category === "Management & General");

  // Filter available industry sectors based on live search query
  const filteredIndustriesForDropdown = useMemo(() => {
    if (!industrySearchQuery.trim()) return industriesList;
    const query = industrySearchQuery.toLowerCase().trim();
    return industriesList.filter(
      (ind) => ind !== "All" && ind.toLowerCase().includes(query)
    );
  }, [industrySearchQuery]);

  const handleIndustrySelect = (industryName: string) => {
    setSelectedIndustry(industryName);
    setIndustryDropdownOpen(false);
    setIndustrySearchQuery("");
  };

  const filteredCompanies = useMemo(() => {
    return SEEDED_COMPANIES.filter((company) => {
      // Branch match
      const matchBranch = selectedBranch === "All" || company.branchIds.includes(selectedBranch);
      // Industry match
      const matchIndustry = selectedIndustry === "All" || company.industry === selectedIndustry;
      // Search query match
      const matchSearch =
        searchQuery.trim() === "" ||
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBranch && matchIndustry && matchSearch;
    });
  }, [searchQuery, selectedBranch, selectedIndustry]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="size-6 text-teal-400" />
            Company Interview Question Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse real placement questions, interview rounds, and hiring patterns across all engineering & management target companies.
          </p>
        </div>
      </div>

      {/* Sticky Compact Filter Bar */}
      <div className="sticky top-4 z-30 p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl shadow-2xl space-y-3.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
          <Input
            type="text"
            name="company_search_input_nonce"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company name, industry, or discipline (e.g. Tata Motors, L&T, Google, Siemens, Biocon, McKinsey)..."
            className="pl-10 bg-slate-950/70 border-slate-800 text-xs h-10 rounded-xl text-white placeholder:text-slate-500 focus-visible:ring-teal-500/40"
          />
        </div>

        {/* Branch Filter Row with Category Separator */}
        <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Layers className="size-3.5 text-teal-400" />
            <span>Target Discipline / Branch:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
            <Button
              size="sm"
              variant={selectedBranch === "All" ? "default" : "outline"}
              onClick={() => setSelectedBranch("All")}
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
                onClick={() => setSelectedBranch(b.id)}
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
                onClick={() => setSelectedBranch(b.id)}
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

        {/* Searchable Industry Dropdown Row */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Industry Sector:</span>
          <div className="relative flex-1 max-w-sm" ref={dropdownRef}>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIndustryDropdownOpen((prev) => !prev)}
                className="w-full justify-between bg-slate-950/70 border-slate-800 text-slate-200 hover:text-white text-xs h-8 px-3 rounded-xl gap-2 font-medium"
              >
                <span className="truncate">
                  {selectedIndustry === "All"
                    ? `Industry (${industriesList.length - 1} sectors available)`
                    : selectedIndustry}
                </span>
                <ChevronDown className="size-3.5 text-slate-400 shrink-0" />
              </Button>

              {selectedIndustry !== "All" && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleIndustrySelect("All")}
                  className="size-8 text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-xl shrink-0"
                  title="Clear industry filter"
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>

            {/* Searchable Dropdown Overlay */}
            {industryDropdownOpen && (
              <div className="absolute left-0 top-10 z-50 w-full sm:w-80 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-2 space-y-2 max-h-80 flex flex-col">
                <div className="relative px-1 pt-1">
                  <Search className="absolute left-3 top-3.5 size-3.5 text-slate-400" />
                  <Input
                    type="text"
                    name="industry_search_input_nonce"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    value={industrySearchQuery}
                    onChange={(e) => setIndustrySearchQuery(e.target.value)}
                    placeholder="Search industry sectors..."
                    className="pl-8 bg-slate-900 border-slate-800 text-xs h-8 rounded-xl text-white placeholder:text-slate-500 focus-visible:ring-teal-500/40"
                    autoFocus
                  />
                </div>

                <div className="overflow-y-auto flex-1 pr-1 space-y-1 scrollbar-thin">
                  {filteredIndustriesForDropdown.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No matching sectors found for "{industrySearchQuery}"
                    </div>
                  ) : (
                    filteredIndustriesForDropdown.map((indName) => {
                      const isSelected = selectedIndustry === indName;
                      return (
                        <button
                          key={indName}
                          onClick={() => handleIndustrySelect(indName)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? "bg-teal-500/20 text-teal-300 font-semibold"
                              : "text-slate-300 hover:bg-slate-900 hover:text-white"
                          }`}
                        >
                          <span className="truncate">
                            {indName === "All" ? "All Industry Sectors" : indName}
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
        </div>
      </div>

      {/* Company Cards Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
          <Building2 className="size-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-semibold text-white">No companies found matching filters</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Try adjusting your search query or reset branch and industry filter buttons.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedBranch("All");
              setSelectedIndustry("All");
              setSearchQuery("");
            }}
            className="border-slate-700 text-slate-300 hover:text-white mt-2"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => {
            const qCount = getCompanyQuestionCount(company.id);

            return (
              <div
                key={company.id}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-4 group shadow-lg hover:shadow-teal-500/5"
              >
                <div className="space-y-3">
                  {/* Logo & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-xl bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center font-bold text-teal-300 text-lg group-hover:scale-105 transition-transform shrink-0">
                        {company.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white leading-tight group-hover:text-teal-300 transition-colors">
                          {company.name}
                        </h2>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {company.industry}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={
                        company.difficultyReputation === "rigorous"
                          ? "border-red-500/40 text-red-400 bg-red-500/10 text-[10px] shrink-0"
                          : "border-amber-500/40 text-amber-300 bg-amber-500/10 text-[10px] shrink-0"
                      }
                    >
                      {company.difficultyReputation === "rigorous" ? "Rigorous" : "Moderate"}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {company.description}
                  </p>

                  {/* Interview Rounds Preview */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Typical Process ({company.typicalRounds.length} Rounds)
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {company.typicalRounds.slice(0, 3).map((round, rIdx) => (
                        <span
                          key={rIdx}
                          className="text-[10px] bg-slate-950/80 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md"
                        >
                          {round}
                        </span>
                      ))}
                      {company.typicalRounds.length > 3 && (
                        <span className="text-[10px] text-slate-500 px-1 py-0.5">
                          +{company.typicalRounds.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
                  <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30 text-xs">
                    {qCount} Questions
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => void navigate({ to: `/user/companies/$companyId`, params: { companyId: company.id } })}
                    className="bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-200 text-xs gap-1.5 rounded-xl transition-all font-semibold"
                  >
                    <span>Practice Questions</span>
                    <ArrowRight className="size-3.5" />
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
