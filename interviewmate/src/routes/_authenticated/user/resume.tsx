import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Cpu,
  Layers,
  GraduationCap,
  Briefcase,
  Code2,
  Plus,
  X,
  FileCode,
  Info,
  ArrowRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DesktopGate } from "@/components/DesktopGate";
import {
  getSavedResume,
  saveResumeProfile,
  deleteResumeProfile,
  parseResumeTextToProfile,
  validateResumeContent,
  type ResumeProfile,
} from "@/lib/resumeStore";
import { createSessionRecord } from "@/lib/sessionStore";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/user/resume")({
  head: () => ({
    meta: [
      { title: "AI Resume Personalization | InterviewMate" },
      { name: "description", content: "Upload your resume for AI-tailored interview practice." },
    ],
  }),
  component: ResumePageWrapper,
});

function ResumePageWrapper() {
  return (
    <DesktopGate>
      <ResumePage />
    </DesktopGate>
  );
}

function ResumePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resume, setResume] = useState<ResumeProfile | null>(() => getSavedResume());
  const [parsing, setParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [showRawText, setShowRawText] = useState(false);
  const [editableRawText, setEditableRawText] = useState("");

  useEffect(() => {
    if (resume) {
      setEditableRawText(resume.rawText);
    }
  }, [resume]);

  const handleLaunchResumePractice = () => {
    if (!resume) return;

    const targetRole = resume.parsed.targetRole || "Technical Specialist";
    const lowerRole = targetRole.toLowerCase();

    let branchId = "cs";
    let branchName = "Computer Science";
    if (lowerRole.includes("chemical") || lowerRole.includes("process")) {
      branchId = "chem";
      branchName = "Chemical Engineering";
    } else if (lowerRole.includes("finance") || lowerRole.includes("account")) {
      branchId = "fin";
      branchName = "Finance & Banking";
    } else if (lowerRole.includes("mechanical")) {
      branchId = "mech";
      branchName = "Mechanical Engineering";
    } else if (lowerRole.includes("civil")) {
      branchId = "civil";
      branchName = "Civil Engineering";
    } else if (lowerRole.includes("electronics") || lowerRole.includes("vlsi")) {
      branchId = "ece";
      branchName = "Electronics & Communication";
    } else if (lowerRole.includes("manager") || lowerRole.includes("consultant")) {
      branchId = "mgmt";
      branchName = "Management & Consulting";
    }

    const session = createSessionRecord({
      userId: "guest_user",
      branchId,
      branchName,
      domainId: targetRole.toLowerCase().replace(/\s+/g, "_"),
      domainName: targetRole,
      difficulty: resume.parsed.experienceLevel.includes("Senior") ? "Difficult" : resume.parsed.experienceLevel.includes("Junior") ? "Easy" : "Moderate",
    });

    toast.success(`Launching practice tailored for ${targetRole}...`);
    void navigate({ to: "/user/session/$sessionId", params: { sessionId: session.id } });
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    // Explicitly wipe prior resume profile from storage & state before analyzing new file
    deleteResumeProfile();
    setResume(null);

    const fileSizeStr = `${(file.size / 1024).toFixed(0)} KB`;
    setParsing(true);
    toast.info(`Analyzing ${file.name} with InterviewMate AI...`);

    const reader = new FileReader();

    reader.onload = (e) => {
      let rawText = (e.target?.result as string) || "";

      // Clean non-printable bytes if binary stream read
      rawText = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ");

      const validation = validateResumeContent(rawText);
      if (!validation.isValid) {
        setParsing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast.error(validation.reason || "The uploaded file does not appear to be a valid resume.");
        return;
      }

      setTimeout(() => {
        const profile = parseResumeTextToProfile(rawText, file.name, fileSizeStr);
        saveResumeProfile(profile);
        setResume(profile);
        setParsing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast.success(`Resume analyzed! Extracted ${profile.parsed.skills.length} skills.`);
      }, 600);
    };

    reader.onerror = () => {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.error("Failed to read file. Try pasting raw resume text below.");
    };

    if (file.name.endsWith(".pdf") || file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = () => {
    deleteResumeProfile();
    setResume(null);
    setEditableRawText("");
    setShowRawText(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Resume data cleared.");
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim() || !resume) return;
    const skillName = newSkillInput.trim();
    if (resume.parsed.skills.includes(skillName)) return;

    const updatedProfile: ResumeProfile = {
      ...resume,
      parsed: {
        ...resume.parsed,
        skills: [...resume.parsed.skills, skillName],
      },
    };

    saveResumeProfile(updatedProfile);
    setResume(updatedProfile);
    setNewSkillInput("");
    toast.success(`Added skill "${skillName}"`);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!resume) return;
    const updatedSkills = resume.parsed.skills.filter((s) => s !== skillToRemove);
    const updatedProfile: ResumeProfile = {
      ...resume,
      parsed: {
        ...resume.parsed,
        skills: updatedSkills,
      },
    };
    saveResumeProfile(updatedProfile);
    setResume(updatedProfile);
    toast.info(`Removed skill "${skillToRemove}"`);
  };

  const handleReparseRawText = () => {
    if (!editableRawText.trim()) {
      toast.error("Please paste or write your resume text first.");
      return;
    }

    const validation = validateResumeContent(editableRawText);
    if (!validation.isValid) {
      toast.error(validation.reason || "The pasted content does not appear to be a valid resume.");
      return;
    }

    // Explicitly wipe prior resume profile before analyzing new raw text
    deleteResumeProfile();
    setResume(null);

    setParsing(true);
    setTimeout(() => {
      const profile = parseResumeTextToProfile(
        editableRawText,
        "Pasted_Resume.txt",
        `${(editableRawText.length / 1024).toFixed(1)} KB`
      );
      saveResumeProfile(profile);
      setResume(profile);
      setParsing(false);
      setShowRawText(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success(`Profile re-analyzed! Detected ${profile.parsed.skills.length} skills.`);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-2xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 border border-teal-500/30 text-teal-300">
              <FileText className="size-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              AI Resume Personalization
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Upload your resume to let InterviewMate AI extract your tech stack, job titles, and experience level. Practice sessions and mock interviews will automatically tailor questions to your actual profile.
          </p>
        </div>

        {resume && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={handleLaunchResumePractice}
              className="bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl gap-2 shadow-lg shadow-teal-500/20"
            >
              <span>Practice Tailored MCQs</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {!resume ? (
        // UPLOAD DROPZONE SCREEN
        <div className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`p-10 rounded-3xl border-2 border-dashed transition-all text-center space-y-5 bg-slate-900/40 ${dragActive
              ? "border-teal-400 bg-teal-500/10 scale-[1.01]"
              : "border-slate-800 hover:border-teal-500/40"
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="size-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/10">
              {parsing ? (
                <RefreshCw className="size-8 animate-spin" />
              ) : (
                <Upload className="size-8" />
              )}
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white">
                {parsing ? "Parsing & Analyzing Resume..." : "Upload your Resume file"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drag and drop your file here, or click to browse. Supports PDF, DOCX, DOC, TXT, or MD files (max 5MB).
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={parsing}
                className="bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-teal-500/20 gap-2"
              >
                <Upload className="size-4" /> Browse File
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRawText(true)}
                className="border-slate-800 text-slate-300 hover:text-white text-xs px-5 py-2.5 rounded-xl gap-2"
              >
                <FileCode className="size-4 text-teal-400" /> Paste Raw Text Instead
              </Button>
            </div>
          </div>

          {/* Raw Text Paste Modal / Area */}
          {showRawText && (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileCode className="size-4 text-teal-400" /> Paste Resume Content Directly
                </h4>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowRawText(false)}
                  className="size-7 text-slate-400 hover:text-white"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <Textarea
                value={editableRawText}
                onChange={(e) => setEditableRawText(e.target.value)}
                placeholder="Paste your full resume text here (experience, skills, projects, education)..."
                className="min-h-[200px] bg-slate-950 border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 rounded-xl leading-relaxed"
              />

              <Button
                onClick={handleReparseRawText}
                disabled={parsing || !editableRawText.trim()}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl gap-2"
              >
                <Sparkles className="size-4" /> Analyze Resume Text
              </Button>
            </div>
          )}

          {/* Info Banner */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
            <Info className="size-4 text-teal-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-semibold text-white">How it works:</span> InterviewMate AI extracts your programming languages, frameworks, and job target. When taking practice tests or company mock interviews, 60–70% of questions will focus on your resume skills.
            </p>
          </div>
        </div>
      ) : (
        // RESUME PROFILE SUMMARY DISPLAY
        <div className="space-y-6">
          {/* File Status & Actions Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
                <CheckCircle2 className="size-5 text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{resume.fileName}</h3>
                  <Badge variant="secondary" className="bg-slate-800 text-teal-300 text-[10px]">
                    {resume.fileSize}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Uploaded & Analyzed on {resume.uploadedAt}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-slate-800 text-slate-300 hover:text-white text-xs gap-1.5 rounded-xl"
              >
                <RefreshCw className="size-3.5" /> Replace File
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs gap-1.5 rounded-xl"
              >
                <Trash2 className="size-3.5" /> Delete
              </Button>
            </div>
          </div>

          {/* AI Extracted Profile Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl shadow-2xl space-y-6">
            {/* Header / Target Role & Experience */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30 text-xs">
                    <Sparkles className="size-3 mr-1" /> AI Analyzed Profile
                  </Badge>
                  <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 text-xs">
                    {resume.parsed.experienceLevel}
                  </Badge>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  {resume.parsed.targetRole}
                </h2>
                <p className="text-xs text-slate-400">{resume.parsed.summary}</p>
              </div>
            </div>

            {/* Extracted Skills Chips Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="size-4" /> Extracted Tech Stack & Skills ({resume.parsed.skills.length})
                </span>
              </div>

              <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                {resume.parsed.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-teal-300 text-xs font-semibold hover:border-teal-500/40 transition-colors"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="size-3.5 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                      title={`Remove ${skill}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Skill Bar */}
              <div className="flex items-center gap-2 max-w-sm pt-1">
                <Input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                  placeholder="Add technology skill (e.g. Docker, GraphQL)..."
                  className="bg-slate-950 border-slate-800 text-xs h-8 rounded-xl text-white placeholder:text-slate-500 focus-visible:ring-teal-500/40"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddSkill}
                  className="border-slate-800 text-teal-300 hover:text-white h-8 px-3 text-xs rounded-xl gap-1 shrink-0"
                >
                  <Plus className="size-3.5" /> Add
                </Button>
              </div>
            </div>

            {/* Grid for Projects & Education */}
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
              {/* Projects Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-teal-400" /> Key Experience & Projects
                </span>
                <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside leading-relaxed">
                  {resume.parsed.topProjects.map((proj, idx) => (
                    <li key={idx} className="line-clamp-2">{proj}</li>
                  ))}
                </ul>
              </div>

              {/* Education Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="size-3.5 text-cyan-400" /> Academic & Education
                </span>
                <p className="text-xs font-semibold text-white">{resume.parsed.education}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Calibrated for core discipline interview standards and domain architecture.
                </p>
              </div>
            </div>

            {/* Dedicated Qualification-Based Practice Section */}
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-teal-500/30 space-y-4 shadow-xl shadow-teal-950/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30 text-xs">
                      <Sparkles className="size-3 mr-1" /> Tailored Interview Prep
                    </Badge>
                    <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 text-xs">
                      {resume.parsed.experienceLevel}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Practice Based on Your Qualifications
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    Based on your profile as a <span className="font-semibold text-teal-300">{resume.parsed.experienceLevel} {resume.parsed.targetRole}</span> with a background in <span className="font-semibold text-cyan-300">{resume.parsed.education}</span>, expect a 10-question evaluation tailored around <span className="font-semibold text-white">{resume.parsed.skills.slice(0, 5).join(", ")}</span>, incorporating scenario challenges drawn from your key project history.
                  </p>
                </div>

                <Button
                  onClick={handleLaunchResumePractice}
                  className="bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl gap-2 shadow-lg shadow-teal-500/20 shrink-0 self-start md:self-center"
                >
                  <Play className="size-4 fill-current" />
                  <span>Start Tailored Practice Session</span>
                </Button>
              </div>
            </div>

            {/* Toggle Raw Text Inspector */}
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRawText((prev) => !prev)}
                className="text-slate-400 hover:text-teal-300 text-xs gap-1.5"
              >
                <FileCode className="size-3.5" />
                {showRawText ? "Hide Parsed Raw Text" : "Inspect Parsed Raw Text"}
              </Button>

              {showRawText && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-200">
                  <Textarea
                    value={editableRawText}
                    onChange={(e) => setEditableRawText(e.target.value)}
                    className="min-h-[160px] bg-transparent border-none text-xs text-slate-300 font-mono leading-relaxed focus-visible:ring-0 resize-none"
                  />
                  <Button
                    size="sm"
                    onClick={handleReparseRawText}
                    className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    Re-Analyze Updated Text
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
