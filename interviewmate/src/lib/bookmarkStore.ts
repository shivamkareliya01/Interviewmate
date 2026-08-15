const BOOKMARKS_PREFIX = "interviewmate_bookmarks_";

function getStorageKey(userId?: string): string {
  const uid = userId || "guest_user";
  return `${BOOKMARKS_PREFIX}${uid}`;
}

export function getBookmarkedIds(userId?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(questionId: string, userId?: string): boolean {
  if (typeof window === "undefined" || !questionId) return false;
  try {
    const existing = getBookmarkedIds(userId);
    const set = new Set(existing);
    let isAdded = false;
    if (set.has(questionId)) {
      set.delete(questionId);
      isAdded = false;
    } else {
      set.add(questionId);
      isAdded = true;
    }
    localStorage.setItem(getStorageKey(userId), JSON.stringify(Array.from(set)));
    return isAdded;
  } catch {
    return false;
  }
}

export function isBookmarked(questionId: string, userId?: string): boolean {
  if (typeof window === "undefined" || !questionId) return false;
  const existing = getBookmarkedIds(userId);
  return existing.includes(questionId);
}
