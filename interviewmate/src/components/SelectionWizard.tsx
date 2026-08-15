import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Laptop,
  Globe,
  Cpu,
  Zap,
  Wrench,
  Building2,
  FlaskConical,
  Plane,
  Car,
  Gauge,
  Dna,
  Layers,
  Pickaxe,
  Sprout,
  BarChart3,
  Code2,
  Briefcase,
  Coins,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  X,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BRANCHES,
  DOMAINS_BY_BRANCH,
  saveLastSessionConfig,
  type Branch,
  type Domain,
  type SessionConfig,
} from "@/lib/branches";
import { createSessionRecord } from "@/lib/sessionStore";
import { useAuth } from "@/hooks/useAuth";

interface SelectionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (config: SessionConfig) => void;
}

const iconMap: Record<string, any> = {
  Laptop,
  Globe,
  Cpu,
  Zap,
  Wrench,
  Building2,
  FlaskConical,
  Plane,
  Car,
  Gauge,
  Dna,
  Layers,
  Pickaxe,
  Sprout,
  BarChart3,
  Code2,
  Briefcase,
  Coins,
  Compass,
};

export function SelectionWizard({ isOpen, onClose, onComplete }: SelectionWizardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || "guest_user";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [categoryFilter, setCategoryFilter] = useState<"All" | "Engineering" | "Management & General">("All");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "Easy" | "Moderate" | "Difficult" | null
  >(null);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && selectedBranch) setStep(2);
    else if (step === 2 && selectedDomain) setStep(3);
  };

  const handleBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const handleFinish = () => {
    if (!selectedBranch || !selectedDomain || !selectedDifficulty) return;

    const config: SessionConfig = {
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      domainId: selectedDomain.id,
      domainName: selectedDomain.name,
      difficulty: selectedDifficulty,
      savedAt: new Date().toISOString(),
    };
    saveLastSessionConfig(config);
    if (onComplete) onComplete(config);

    // Immediately create session record with status: "generating"
    const session = createSessionRecord({
      userId,
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      domainId: selectedDomain.id,
      domainName: selectedDomain.name,
      difficulty: selectedDifficulty,
    });

    onClose();

    // Immediately navigate browser to /user/session/$sessionId
    void navigate({
      to: "/user/session/$sessionId",
      params: { sessionId: session.id },
    });
  };

  const filteredBranches = BRANCHES.filter((b) => {
    if (categoryFilter === "All") return true;
    return b.category === categoryFilter;
  });

  const availableDomains = selectedBranch
    ? DOMAINS_BY_BRANCH[selectedBranch.id] || DOMAINS_BY_BRANCH.cse
    : [];

  const progressPercentage = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 font-sans text-slate-100">
      <div className="w-full max-w-4xl rounded-3xl bg-slate-900/95 border border-teal-500/30 p-6 md:p-8 shadow-2xl shadow-teal-950/40 relative overflow-hidden flex flex-col space-y-6 max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="size-5" />
        </button>

        {/* Top Progress Bar & Step Counter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className="text-teal-400 font-bold">Step {step} of 3</span>
            <span>
              {step === 1 ? "Select Branch" : step === 2 ? "Select Domain" : "Difficulty Calibration"}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* STEP 1: SELECT BRANCH */}
        {step === 1 && (
          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Which branch are you from?
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your background from 18+ Engineering & Management branches.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                {(["All", "Engineering", "Management & General"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      categoryFilter === cat
                        ? "bg-teal-500 text-slate-950"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {filteredBranches.map((b) => {
                const Icon = iconMap[b.iconName] || Laptop;
                const isSelected = selectedBranch?.id === b.id;

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBranch(b)}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? "bg-gradient-to-tr from-teal-500/20 to-teal-500/5 border-teal-400 shadow-lg shadow-teal-500/20 ring-1 ring-teal-400"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`size-9 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? "bg-teal-500 text-slate-950"
                            : "bg-slate-900 text-teal-400 border border-teal-500/20"
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>
                      {isSelected && <CheckCircle2 className="size-4.5 text-teal-400" />}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                        {b.code}
                      </span>
                      <h3 className="text-xs font-bold text-white mt-0.5 line-clamp-1">{b.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                        {b.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: SELECT DOMAIN */}
        {step === 2 && (
          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-1">
                <span>Branch: {selectedBranch?.name}</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Which domain do you want to be tested on?
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Domains are automatically filtered to match your chosen branch.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {availableDomains.map((d) => {
                const isSelected = selectedDomain?.id === d.id;

                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDomain(d)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? "bg-gradient-to-tr from-teal-500/20 to-teal-500/5 border-teal-400 shadow-lg shadow-teal-500/20 ring-1 ring-teal-400"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-white leading-snug">{d.name}</h3>
                      {isSelected && <CheckCircle2 className="size-4 text-teal-400 flex-shrink-0" />}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{d.description}</p>

                    <div className="pt-2 border-t border-slate-800/60 text-[10px] text-teal-400 font-semibold">
                      ⚡ {d.questionCount} questions available
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: SELECT DIFFICULTY */}
        {step === 3 && (
          <div className="space-y-6 flex-1 overflow-y-auto pr-1">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-1">
                <span>
                  {selectedBranch?.code} • {selectedDomain?.name}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Choose your difficulty level
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Selecting a difficulty will open a brand-new session page and generate your challenge.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  id: "Easy",
                  label: "Easy",
                  borderClass: "border-emerald-500/40 hover:border-emerald-400",
                  selectedClass: "bg-emerald-500/10 border-emerald-400 ring-1 ring-emerald-400",
                  badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                  subtitle: "Good for beginners & fundamentals (~5–8 mins)",
                },
                {
                  id: "Moderate",
                  label: "Moderate",
                  borderClass: "border-amber-500/40 hover:border-amber-400",
                  selectedClass: "bg-amber-500/10 border-amber-400 ring-1 ring-amber-400",
                  badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
                  subtitle: "For those comfortable combining 2+ concepts (~8–12 mins)",
                },
                {
                  id: "Difficult",
                  label: "Difficult",
                  borderClass: "border-rose-500/40 hover:border-rose-400",
                  selectedClass: "bg-rose-500/10 border-rose-400 ring-1 ring-rose-400",
                  badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/30",
                  subtitle: "Challenging interview-level depth & optimization (~12–20 mins)",
                },
              ].map((diff) => {
                const isSelected = selectedDifficulty === diff.id;

                return (
                  <div
                    key={diff.id}
                    onClick={() =>
                      setSelectedDifficulty(
                        diff.id as "Easy" | "Moderate" | "Difficult"
                      )
                    }
                    className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                      isSelected ? diff.selectedClass : `bg-slate-950/60 ${diff.borderClass}`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Badge className={diff.badgeClass}>{diff.label}</Badge>
                      {isSelected && <CheckCircle2 className="size-5 text-teal-400" />}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{diff.subtitle}</p>

                    <div className="text-[11px] text-teal-400/80 font-medium pt-2 border-t border-slate-800">
                      ⚡ Opens /user/session/$sessionId
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-slate-800 text-slate-300 hover:bg-slate-800 gap-2 rounded-xl text-xs"
            >
              <ArrowLeft className="size-4" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={(step === 1 && !selectedBranch) || (step === 2 && !selectedDomain)}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold gap-2 rounded-xl text-xs px-6"
            >
              Next Step <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={!selectedDifficulty}
              className="bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold gap-2 rounded-xl text-xs px-6 shadow-lg shadow-teal-500/20"
            >
              <Sparkles className="size-4" /> Start Session & Open Route
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
