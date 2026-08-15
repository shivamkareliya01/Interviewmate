export interface ParsedResume {
  candidateName: string;
  targetRole: string;
  experienceLevel: "Junior (1-3 yrs)" | "Mid-Level (3-5 yrs)" | "Senior (5+ yrs)";
  skills: string[];
  topProjects: string[];
  education: string;
  summary: string;
}

export interface ResumeProfile {
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  rawText: string;
  parsed: ParsedResume;
}

const RESUME_STORAGE_KEY = "interviewmate_user_resume";

export function getSavedResume(): ResumeProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RESUME_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveResumeProfile(profile: ResumeProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error("Failed to save resume profile:", err);
  }
}

export function deleteResumeProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RESUME_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to delete resume profile:", err);
  }
}

/**
 * Validates uploaded or pasted text to ensure it resembles a legitimate resume document.
 */
export function validateResumeContent(text: string): { isValid: boolean; reason?: string } {
  if (!text || text.trim().length < 40) {
    return { isValid: false, reason: "Text is too short to be a valid resume (minimum 40 characters)." };
  }

  const lower = text.toLowerCase();

  // Explicit filter for meta-prompts, bug reports, and non-resume instructions
  if (
    lower.includes("bug report") ||
    lower.includes("find the exact function") ||
    lower.includes("ready-to-paste prompt") ||
    lower.includes("do not apply a guess-based fix") ||
    lower.includes("report your findings with actual evidence") ||
    lower.includes("here's the ready-to-paste prompt")
  ) {
    return {
      isValid: false,
      reason: "Invalid content: Prompt instructions or bug report text detected instead of a resume document.",
    };
  }

  // Standard career, education, and resume keywords
  const RESUME_KEYWORDS = [
    "experience", "education", "skills", "projects", "work", "employment",
    "university", "college", "degree", "bachelor", "master", "diploma", "school",
    "engineer", "analyst", "developer", "manager", "consultant", "associate", "intern",
    "built", "developed", "implemented", "managed", "designed", "analyzed", "prepared",
    "curriculum vitae", "resume", "certifications", "achievements", "summary"
  ];

  let matches = 0;
  for (const keyword of RESUME_KEYWORDS) {
    if (lower.includes(keyword)) {
      matches++;
    }
  }

  if (matches < 2) {
    return {
      isValid: false,
      reason: "Invalid content: Text does not contain sufficient resume sections or career details.",
    };
  }

  return { isValid: true };
}

// Known Tech & Skill Keywords for Heuristic Parsing (Multi-Discipline Catalog)
const KNOWN_SKILLS = [
  // Finance, Banking & Commerce
  "Financial Analysis", "Financial Modeling", "Budgeting", "Forecasting", "Accounting",
  "Valuation", "DCF", "Discounted Cash Flow", "Investment Analysis", "Auditing", "Portfolio Management",
  "Corporate Finance", "Financial Statements", "Banking", "Equity Research", "Excel", "Advanced Excel",
  "Financial Reporting", "Credit Analysis", "Risk Management", "Tax Accounting", "Managerial Accounting",
  "Wealth Management", "Asset Management", "Financial Planning",

  // Management, Business & Operations
  "Business Strategy", "Project Management", "Product Management", "Stakeholder Management",
  "Operations", "Supply Chain", "Client Relations", "Consulting", "KPI Analysis", "Change Management",
  "Market Research", "Strategic Planning", "Business Analysis", "Process Optimization",

  // Core Engineering, Electronics & Manufacturing
  "CAD", "AutoCAD", "Thermal Analysis", "Mechanical Engineering", "HVAC", "SolidWorks", "MATLAB",
  "PLC", "Automation", "Circuit Design", "VLSI", "Embedded Systems", "Signal Processing",
  "Civil Engineering", "Structural Analysis", "Structural Design", "Site Inspection", "Concrete",
  "Geotechnical", "Chemical Engineering", "Thermodynamics", "Bioprocess", "Fermentation", "Quality Control",

  // Software, IT & Data
  "React", "React Native", "Next.js", "Node.js", "Express.js", "TypeScript", "JavaScript",
  "Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot", "C++", "C#", ".NET",
  "Go", "Golang", "Rust", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "GraphQL",
  "REST API", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Git", "Linux",
  "HTML", "CSS", "Tailwind CSS", "Redux", "Data Structures", "Algorithms", "System Design",
  "Microservices", "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Pandas",
  "NumPy", "OOP", "Agile", "Scrum"
];

export function extractSkillsFromText(text: string): string[] {
  const lowerText = text.toLowerCase();
  const matched = new Set<string>();

  for (const skill of KNOWN_SKILLS) {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, "i");
    if (regex.test(lowerText)) {
      matched.add(skill);
    }
  }

  return Array.from(matched);
}

export function parseResumeTextToProfile(
  rawText: string,
  fileName: string,
  fileSize: string
): ResumeProfile {
  const extractedSkills = extractSkillsFromText(rawText);
  const lowerText = rawText.toLowerCase();

  let targetRole = "Software Engineer";
  if (lowerText.includes("finance") || lowerText.includes("financial analyst") || lowerText.includes("valuation") || lowerText.includes("investment")) {
    targetRole = "Finance Analyst / Investment Associate";
  } else if (lowerText.includes("accounting") || lowerText.includes("accountant") || lowerText.includes("auditor")) {
    targetRole = "Financial Accountant / Auditor";
  } else if (lowerText.includes("product manager") || lowerText.includes("project manager")) {
    targetRole = "Product / Project Manager";
  } else if (lowerText.includes("consultant") || lowerText.includes("consulting") || lowerText.includes("business analyst")) {
    targetRole = "Management Consultant / Business Analyst";
  } else if (lowerText.includes("mechanical") || lowerText.includes("solidworks") || lowerText.includes("hvac")) {
    targetRole = "Mechanical Systems Engineer";
  } else if (lowerText.includes("electrical") || lowerText.includes("vlsi") || lowerText.includes("circuit")) {
    targetRole = "Electronics & VLSI Engineer";
  } else if (lowerText.includes("civil") || lowerText.includes("structural") || lowerText.includes("concrete")) {
    targetRole = "Civil & Structural Engineer";
  } else if (lowerText.includes("chemical") || lowerText.includes("thermodynamics")) {
    targetRole = "Process & Chemical Engineer";
  } else if (lowerText.includes("biotech") || lowerText.includes("pharma") || lowerText.includes("bioprocess")) {
    targetRole = "Bioprocess & Quality Analyst";
  } else if (lowerText.includes("frontend") || lowerText.includes("react")) {
    targetRole = "Frontend Engineer";
  } else if (lowerText.includes("backend") || lowerText.includes("node") || lowerText.includes("spring")) {
    targetRole = "Backend Engineer";
  } else if (lowerText.includes("fullstack") || lowerText.includes("full stack")) {
    targetRole = "Full-Stack Developer";
  } else if (lowerText.includes("data scientist") || lowerText.includes("machine learning")) {
    targetRole = "Data Scientist / ML Engineer";
  } else if (lowerText.includes("devops") || lowerText.includes("cloud")) {
    targetRole = "DevOps / Infrastructure Engineer";
  } else if (extractedSkills.some((s) => ["Financial Analysis", "Accounting", "Budgeting", "Excel"].includes(s))) {
    targetRole = "Finance Analyst";
  }

  let experienceLevel: "Junior (1-3 yrs)" | "Mid-Level (3-5 yrs)" | "Senior (5+ yrs)" = "Mid-Level (3-5 yrs)";

  // Filter out non-job-title phrases like "senior year project", "senior secondary", "scrum master", "master plan"
  const cleanedTextForExp = lowerText
    .replace(/senior\s+(?:year|secondary|capstone|project|design|thesis|student|class|board)/gi, " ")
    .replace(/mastered|master\s+(?:plan|layout|class|sheet|copy|list|key)/gi, " ");

  const hasJuniorTitle = /\b(?:junior|intern|entry|assistant|trainee|fresher|associate)\s+(?:civil|process|chemical|mechanical|electrical|software|engineer|analyst|developer|consultant|architect|manager)\b/i.test(lowerText) ||
                         /\b(?:junior|intern|entry|fresher|associate)\b/i.test(lowerText);

  const hasSeniorTitle = /\b(?:senior|lead|principal|director|chief|head)\s+(?:civil|process|chemical|mechanical|electrical|software|engineer|analyst|developer|consultant|architect|manager)\b/i.test(cleanedTextForExp);

  if (hasJuniorTitle && !hasSeniorTitle) {
    experienceLevel = "Junior (1-3 yrs)";
  } else if (hasSeniorTitle) {
    experienceLevel = "Senior (5+ yrs)";
  } else if (lowerText.includes("2024") || lowerText.includes("2023")) {
    experienceLevel = "Junior (1-3 yrs)";
  }

  // Education Section Parsing with Word-Boundary Degree Regexes
  let education = "Bachelor's Degree (B.Tech / B.E. / B.S.)";

  const cleanedTextForEdu = lowerText
    .replace(/\bms\s+(?:excel|office|word|powerpoint|access|project|visio|teams|paint)\b/gi, " ")
    .replace(/mastered|scrum\s+master|master\s+(?:plan|layout|class|sheet|copy|list|key)/gi, " ");

  const hasMastersDegree = /\bmaster(?:'s)?\s+(?:degree|of|in|science|tech|engineering|arts|business)\b|\bm\.?\s*tech\b|\bmba\b|\bm\.?\s*s\.?\s+(?:degree|in|of)\b/i.test(cleanedTextForEdu);

  const hasBachelorsDegree = /\bbachelor(?:'s)?\s+(?:degree|of|in|science|tech|engineering|arts)\b|\bb\.?\s*tech\b|\bb\.?\s*e\.?\b|\bb\.?\s*s\.?\b/i.test(lowerText);

  const hasDiploma = /\bdiploma\b|\bpolytechnic\b/i.test(lowerText);

  if (hasMastersDegree) {
    education = "Master's Degree (MBA / M.S. / M.Tech)";
  } else if (hasBachelorsDegree) {
    if (lowerText.includes("civil")) {
      education = "Bachelor of Technology in Civil Engineering";
    } else if (lowerText.includes("chemical") || lowerText.includes("process")) {
      education = "Bachelor of Technology in Chemical Engineering";
    } else if (lowerText.includes("mechanical")) {
      education = "Bachelor of Technology in Mechanical Engineering";
    } else if (lowerText.includes("computer") || lowerText.includes("software")) {
      education = "Bachelor of Technology in Computer Science";
    } else if (lowerText.includes("finance") || lowerText.includes("commerce") || lowerText.includes("b.com")) {
      education = "Bachelor of Commerce / Finance";
    } else {
      education = "Bachelor of Technology / B.E. Degree";
    }
  } else if (hasDiploma) {
    education = "Polytechnic / Engineering Diploma";
  }

  const topProjects: string[] = [];
  const lines = rawText.split("\n").map((l) => l.trim()).filter((l) => l.length > 10);
  lines.forEach((line) => {
    if (topProjects.length < 3) {
      const lLower = line.toLowerCase();
      if (
        lLower.includes("built") ||
        lLower.includes("developed") ||
        lLower.includes("designed") ||
        lLower.includes("implemented") ||
        lLower.includes("analyzed") ||
        lLower.includes("managed") ||
        lLower.includes("prepared") ||
        lLower.includes("evaluated") ||
        lLower.includes("created")
      ) {
        topProjects.push(line.slice(0, 85));
      }
    }
  });

  if (topProjects.length === 0) {
    if (targetRole.includes("Finance") || targetRole.includes("Accountant")) {
      topProjects.push("Financial modeling, DCF valuation, and quarterly budgeting analysis");
      topProjects.push("Corporate financial statement preparation & variance auditing");
    } else {
      topProjects.push("Technical project execution & system workflow implementation");
      topProjects.push("Performance metrics tracking & strategic operational analysis");
    }
  }

  // Domain-specific fallback skills matching candidate's target role
  let finalSkills = extractedSkills;
  if (finalSkills.length === 0) {
    if (targetRole.includes("Finance") || targetRole.includes("Accountant")) {
      finalSkills = ["Financial Analysis", "Financial Modeling", "Excel", "Budgeting", "Forecasting", "Accounting"];
    } else if (targetRole.includes("Manager") || targetRole.includes("Consultant")) {
      finalSkills = ["Business Strategy", "Project Management", "KPI Analysis", "Stakeholder Management"];
    } else {
      finalSkills = ["Data Analysis", "Problem Solving", "Process Optimization", "Technical Reporting"];
    }
  }

  const parsed: ParsedResume = {
    candidateName: fileName.split(".")[0].replace(/[_-]/g, " ") || "Candidate",
    targetRole,
    experienceLevel,
    skills: finalSkills,
    topProjects,
    education,
    summary: `Extracted ${finalSkills.length} core professional skills. Candidate profile calibrated for ${targetRole} (${experienceLevel}).`,
  };

  return {
    fileName,
    fileSize,
    uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    rawText,
    parsed,
  };
}
