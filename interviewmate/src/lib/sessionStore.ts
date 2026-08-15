import { type GroqQuestion } from "@/lib/groq";

export interface PracticeSession {
  id: string;
  userId: string;
  branchId: string;
  branchName: string;
  domainId: string;
  domainName: string;
  difficulty: "Easy" | "Moderate" | "Difficult";
  status: "generating" | "ready" | "error";
  questions: GroqQuestion[];
  currentQuestionIndex: number;
  mcqAnswers: Record<number, number>; // question id -> option index selected
  mcqScore: number; // total correct MCQs
  codingScores: Record<number, number>; // question index -> score evaluated
  codingScore: number; // exact average AI score for coding
  errorMessage?: string;
  createdAt: string;
}

const SESSIONS_STORAGE_KEY = "interviewmate_practice_sessions";

export function getAllSessions(): PracticeSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: PracticeSession[] = JSON.parse(raw);
    return parsed.map((s) => {
      const codingScores = s.codingScores || {};
      const scoreValues = Object.values(codingScores);
      const calculatedCodingScore =
        scoreValues.length > 0
          ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
          : typeof s.codingScore === "number"
          ? s.codingScore
          : 0;

      return {
        ...s,
        questions: Array.isArray(s.questions) ? s.questions : [],
        mcqAnswers: s.mcqAnswers || {},
        mcqScore: typeof s.mcqScore === "number" ? s.mcqScore : 0,
        codingScores,
        codingScore: calculatedCodingScore,
        currentQuestionIndex: typeof s.currentQuestionIndex === "number" ? s.currentQuestionIndex : 0,
      };
    });
  } catch {
    return [];
  }
}

export function getSessionById(sessionId: string): PracticeSession | null {
  const sessions = getAllSessions();
  return sessions.find((s) => s.id === sessionId) || null;
}

export function createSessionRecord(params: {
  userId: string;
  branchId: string;
  branchName: string;
  domainId: string;
  domainName: string;
  difficulty: "Easy" | "Moderate" | "Difficult";
}): PracticeSession {
  const newSession: PracticeSession = {
    id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: params.userId,
    branchId: params.branchId,
    branchName: params.branchName,
    domainId: params.domainId,
    domainName: params.domainName,
    difficulty: params.difficulty,
    status: "generating",
    questions: [],
    currentQuestionIndex: 0,
    mcqAnswers: {},
    mcqScore: 0,
    codingScores: {},
    codingScore: 0,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const existing = getAllSessions();
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify([newSession, ...existing]));
  }

  return newSession;
}

export function updateSessionRecord(
  sessionId: string,
  updates: Partial<PracticeSession>
): PracticeSession | null {
  if (typeof window === "undefined") return null;

  const sessions = getAllSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) return null;

  const updatedSession = { ...sessions[index], ...updates };
  sessions[index] = updatedSession;
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));

  return updatedSession;
}

const SEEN_TITLES_STORAGE_KEY = "interviewmate_seen_questions";

export function getRecentlySeenTitles(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEEN_TITLES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordRecentlySeenTitles(titles: string[]): void {
  if (typeof window === "undefined" || !Array.isArray(titles) || titles.length === 0) return;
  try {
    const existing = getRecentlySeenTitles();
    const updated = Array.from(new Set([...titles, ...existing])).slice(0, 60);
    localStorage.setItem(SEEN_TITLES_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}
