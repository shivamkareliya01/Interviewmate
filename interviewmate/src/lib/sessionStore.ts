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
const MASTER_KEY = "interviewmate_session_ids";

let migrationDone = false;
function migrateLegacyData() {
  if (typeof window === "undefined" || migrationDone) return;
  const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
        const ids: string[] = [];
        parsed.forEach(s => {
          if (s && s.id) {
            ids.push(s.id);
            localStorage.setItem(`interviewmate_session_${s.id}`, JSON.stringify(s));
          }
        });
        localStorage.setItem(MASTER_KEY, JSON.stringify(ids));
        localStorage.removeItem(SESSIONS_STORAGE_KEY);
        console.log(`[SessionStore] Migrated ${ids.length} legacy sessions to new format.`);
      }
    } catch {}
  }
  migrationDone = true;
}

function processSession(s: any): PracticeSession {
  const codingScores = s.codingScores || {};
  const scoreValues = Object.values(codingScores) as number[];
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
}

export function getAllSessions(): PracticeSession[] {
  if (typeof window === "undefined") return [];
  migrateLegacyData();
  try {
    const rawIds = localStorage.getItem(MASTER_KEY);
    if (!rawIds) return [];
    const ids: string[] = JSON.parse(rawIds);
    const sessions: PracticeSession[] = [];
    
    ids.forEach(id => {
       const rawSession = localStorage.getItem(`interviewmate_session_${id}`);
       if (rawSession) {
          try {
             sessions.push(processSession(JSON.parse(rawSession)));
          } catch {}
       }
    });
    return sessions;
  } catch {
    return [];
  }
}

export function getSessionById(sessionId: string): PracticeSession | null {
  if (typeof window === "undefined") return null;
  migrateLegacyData();
  const rawSession = localStorage.getItem(`interviewmate_session_${sessionId}`);
  if (!rawSession) return null;
  try {
     return processSession(JSON.parse(rawSession));
  } catch {
     return null;
  }
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
    migrateLegacyData();
    let ids: string[] = [];
    const rawIds = localStorage.getItem(MASTER_KEY);
    if (rawIds) {
      try { ids = JSON.parse(rawIds); } catch {}
    }
    ids = [newSession.id, ...ids];
    localStorage.setItem(MASTER_KEY, JSON.stringify(ids));
    localStorage.setItem(`interviewmate_session_${newSession.id}`, JSON.stringify(newSession));
  }

  return newSession;
}

export function updateSessionRecord(
  sessionId: string,
  updates: Partial<PracticeSession>
): PracticeSession | null {
  if (typeof window === "undefined") return null;
  migrateLegacyData();

  const rawSession = localStorage.getItem(`interviewmate_session_${sessionId}`);
  if (!rawSession) return null;

  try {
    const session = JSON.parse(rawSession);
    const updatedSession = { ...session, ...updates };
    localStorage.setItem(`interviewmate_session_${sessionId}`, JSON.stringify(updatedSession));
    return processSession(updatedSession);
  } catch {
    return null;
  }
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
