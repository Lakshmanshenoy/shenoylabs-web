/**
 * reading-store.ts
 * Pure localStorage helpers for the gamified reading experience.
 * All reads return safe defaults; all writes are no-ops on the server.
 */

const STORE_KEY = "shenoylabs:reading:v2";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ArticleVisit = {
  slug: string;
  title: string;
  category: string;
  firstVisit: number; // ms timestamp
  lastVisit: number;  // ms timestamp
  scrollPct: number;  // 0–100, last known scroll position
  completed: boolean; // true once scrollPct >= 80
};

export type Bookmark = {
  slug: string;
  title: string;
  category: string;
  note: string;
  savedAt: number;
};

export type StreakData = {
  current: number;
  longest: number;
  lastReadDate: string; // YYYY-MM-DD local time
};

export type ReadingStore = {
  visits: Record<string, ArticleVisit>;
  bookmarks: Bookmark[];
  streak: StreakData;
  earnedBadges: string[];
};

// ─── Badge definitions ────────────────────────────────────────────────────────

export type BadgeDef = {
  id: string;
  label: string;
  emoji: string;
  description: string;
};

export const ALL_BADGES: BadgeDef[] = [
  { id: "first_read",      label: "First Steps",          emoji: "📖", description: "Read your first article" },
  { id: "streak_3",        label: "On a Roll",            emoji: "🔥", description: "3-day reading streak" },
  { id: "streak_7",        label: "Week Warrior",         emoji: "⚡", description: "7-day reading streak" },
  { id: "streak_30",       label: "Monthly Reader",       emoji: "🌟", description: "30-day reading streak" },
  { id: "completionist_3", label: "Getting Started",      emoji: "✅", description: "Completed 3 articles" },
  { id: "completionist_5", label: "Deep Diver",           emoji: "🎯", description: "Completed 5 articles" },
  { id: "completionist_10",label: "Series Completionist", emoji: "🏆", description: "Completed 10 articles" },
  { id: "bookmarker",      label: "Collector",            emoji: "🔖", description: "Saved your first bookmark" },
  { id: "night_owl",       label: "Night Owl",            emoji: "🦉", description: "Read between midnight and 5 am" },
];

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_STORE: ReadingStore = {
  visits: {},
  bookmarks: [],
  streak: { current: 0, longest: 0, lastReadDate: "" },
  earnedBadges: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.round(Math.abs(b - a) / 86_400_000);
}

// ─── Read / Write ─────────────────────────────────────────────────────────────

export function readStore(): ReadingStore {
  if (typeof window === "undefined") return DEFAULT_STORE;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return structuredClone(DEFAULT_STORE);
    const parsed = JSON.parse(raw) as Partial<ReadingStore>;
    return {
      visits:       parsed.visits       ?? {},
      bookmarks:    parsed.bookmarks    ?? [],
      streak:       parsed.streak       ?? structuredClone(DEFAULT_STORE.streak),
      earnedBadges: parsed.earnedBadges ?? [],
    };
  } catch {
    return structuredClone(DEFAULT_STORE);
  }
}

function writeStore(store: ReadingStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // quota exceeded — silently swallow
  }
}

// ─── Streak logic ─────────────────────────────────────────────────────────────

function computeStreak(current: StreakData): StreakData {
  const todayStr = today();
  if (current.lastReadDate === todayStr) return current; // already counted today

  const delta = current.lastReadDate ? daysBetween(current.lastReadDate, todayStr) : 0;
  const newCurrent = delta <= 1 ? current.current + 1 : 1;
  const newLongest = Math.max(current.longest, newCurrent);

  return { current: newCurrent, longest: newLongest, lastReadDate: todayStr };
}

// ─── Badge evaluation ─────────────────────────────────────────────────────────

function evaluateBadges(store: ReadingStore): string[] {
  const earned = new Set(store.earnedBadges);

  const completedCount = Object.values(store.visits).filter((v) => v.completed).length;

  if (completedCount >= 1)  earned.add("first_read");
  if (completedCount >= 3)  earned.add("completionist_3");
  if (completedCount >= 5)  earned.add("completionist_5");
  if (completedCount >= 10) earned.add("completionist_10");

  if (store.streak.current >= 3)  earned.add("streak_3");
  if (store.streak.current >= 7)  earned.add("streak_7");
  if (store.streak.current >= 30) earned.add("streak_30");

  if (store.bookmarks.length >= 1) earned.add("bookmarker");

  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) earned.add("night_owl");

  return Array.from(earned);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Record a visit to an article. Returns any newly earned badge IDs. */
export function recordVisit(
  slug: string,
  title: string,
  category: string,
): { store: ReadingStore; newBadges: string[] } {
  const store = readStore();
  const existing = store.visits[slug];
  const now = Date.now();

  store.visits[slug] = {
    slug,
    title,
    category,
    firstVisit: existing?.firstVisit ?? now,
    lastVisit: now,
    scrollPct: existing?.scrollPct ?? 0,
    completed: existing?.completed ?? false,
  };

  store.streak = computeStreak(store.streak);

  const previousBadges = new Set(store.earnedBadges);
  store.earnedBadges = evaluateBadges(store);
  const newBadges = store.earnedBadges.filter((b) => !previousBadges.has(b));

  writeStore(store);
  return { store, newBadges };
}

/** Save the scroll position for the current article. Marks completed at >= 80%. */
export function saveScrollPosition(slug: string, scrollPct: number): void {
  const store = readStore();
  const visit = store.visits[slug];
  if (!visit) return;

  visit.scrollPct = scrollPct;
  if (scrollPct >= 80) visit.completed = true;

  const previousBadges = new Set(store.earnedBadges);
  store.earnedBadges = evaluateBadges(store);
  const newBadges = store.earnedBadges.filter((b) => !previousBadges.has(b));

  writeStore(store);

  // Emit a custom event for the badge toast — read tracker can listen for it
  if (newBadges.length > 0 && typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("shenoylabs:new-badges", { detail: { newBadges } }),
    );
  }
}

/** Toggle a bookmark. Returns whether it's now bookmarked. */
export function toggleBookmark(
  slug: string,
  title: string,
  category: string,
  note = "",
): boolean {
  const store = readStore();
  const idx = store.bookmarks.findIndex((b) => b.slug === slug);

  if (idx >= 0) {
    store.bookmarks.splice(idx, 1);
    writeStore(store);
    return false;
  }

  store.bookmarks.push({ slug, title, category, note, savedAt: Date.now() });
  store.earnedBadges = evaluateBadges(store);
  writeStore(store);
  return true;
}

/** Update the note on an existing bookmark. */
export function updateBookmarkNote(slug: string, note: string): void {
  const store = readStore();
  const bookmark = store.bookmarks.find((b) => b.slug === slug);
  if (bookmark) {
    bookmark.note = note;
    writeStore(store);
  }
}

/** Returns a human-friendly "N months ago" string for the first visit, or null. */
export function lastReadLabel(slug: string): string | null {
  const store = readStore();
  const visit = store.visits[slug];
  if (!visit) return null;

  const diffMs = Date.now() - visit.firstVisit;
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7)   return `${diffDays} days ago`;
  if (diffDays < 30)  return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? "s" : ""} ago`;
}

/** Returns % completion stats across all articles. */
export function getTopicMastery(store: ReadingStore): {
  totalRead: number;
  totalCompleted: number;
  byCategory: Record<string, { read: number; completed: number }>;
} {
  const visits = Object.values(store.visits);
  const totalRead = visits.length;
  const totalCompleted = visits.filter((v) => v.completed).length;

  const byCategory: Record<string, { read: number; completed: number }> = {};
  for (const v of visits) {
    if (!byCategory[v.category]) byCategory[v.category] = { read: 0, completed: 0 };
    byCategory[v.category].read++;
    if (v.completed) byCategory[v.category].completed++;
  }

  return { totalRead, totalCompleted, byCategory };
}
