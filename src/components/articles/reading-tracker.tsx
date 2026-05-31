"use client";

/**
 * ArticleReadingTracker
 * Handles all localStorage-based reading gamification for a single article:
 *  - Records visit + updates streak on mount
 *  - Shows "You read this X ago" badge in article header
 *  - Shows reading streak flame
 *  - Tracks scroll → marks completed at 80 %
 *  - Saves / restores scroll position with a "Continue reading" banner
 *  - Earns + toasts new badges
 *  - BookmarkButton (save / unsave with notes)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, Trophy, Flame, X, Check } from "lucide-react";

import {
  type ReadingStore,
  type BadgeDef,
  ALL_BADGES,
  lastReadLabel,
  readStore,
  recordVisit,
  saveScrollPosition,
  toggleBookmark,
  updateBookmarkNote,
} from "@/lib/reading-store";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ArticleReadingTrackerProps = {
  slug: string;
  title: string;
  category: string;
};

// ─── Badge toast ──────────────────────────────────────────────────────────────

function BadgeToast({
  badge,
  onDismiss,
}: {
  badge: BadgeDef;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-in slide-in-from-bottom-4 fade-in fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xl"
    >
      <span className="text-2xl" aria-hidden="true">{badge.emoji}</span>
      <div>
        <p className="text-xs font-semibold tracking-[0.08em] text-primary uppercase">
          Badge Unlocked
        </p>
        <p className="font-heading text-sm font-semibold">{badge.label}</p>
        <p className="text-[11px] text-muted-foreground">{badge.description}</p>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss badge notification"
        className="ml-1 rounded p-1 text-muted-foreground/60 hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

// ─── Continue Reading Banner ──────────────────────────────────────────────────

function ContinueBanner({
  pct,
  onContinue,
  onDismiss,
}: {
  pct: number;
  onContinue: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      role="banner"
      className="animate-in slide-in-from-top-2 fade-in mb-4 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm"
    >
      <span className="text-foreground/80">
        You left off at <strong>{pct}%</strong> — continue from where you stopped?
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={onContinue}
          className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Continue
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="rounded p-1 text-muted-foreground/60 hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Bookmark Button ──────────────────────────────────────────────────────────

export function BookmarkButton({
  slug,
  title,
  category,
  className,
}: {
  slug: string;
  title: string;
  category: string;
  className?: string;
}) {
  const [saved, setSaved] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const store = readStore();
    return !!store.bookmarks.find((b) => b.slug === slug);
  });
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const store = readStore();
    return store.bookmarks.find((b) => b.slug === slug)?.note ?? "";
  });
  const [justSaved, setJustSaved] = useState(false);

  const handleToggle = () => {
    const isNowSaved = toggleBookmark(slug, title, category, note);
    setSaved(isNowSaved);
    if (isNowSaved) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      setShowNote(true);
    } else {
      setShowNote(false);
      setNote("");
    }
  };

  const handleNoteBlur = () => {
    if (saved) updateBookmarkNote(slug, note);
    setShowNote(false);
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={handleToggle}
        aria-label={saved ? "Remove bookmark" : "Save to reading list"}
        title={saved ? "Remove bookmark" : "Save to reading list"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors",
          saved
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary",
        )}
      >
        {justSaved ? (
          <Check className="size-3.5" />
        ) : saved ? (
          <BookmarkCheck className="size-3.5" />
        ) : (
          <Bookmark className="size-3.5" />
        )}
        {justSaved ? "Saved!" : saved ? "Bookmarked" : "Bookmark"}
      </button>

      {showNote && saved && (
        <div className="animate-in fade-in absolute top-full left-0 z-20 mt-1 w-64 rounded-xl border border-border bg-popover p-3 shadow-lg">
          <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">
            Add a note (optional)
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleNoteBlur}
            placeholder="Why did you save this?"
            rows={2}
            className="w-full resize-none rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
             
            autoFocus
          />
          <button
            onClick={handleNoteBlur}
            className="mt-2 w-full rounded-md border border-border px-2 py-1 text-[11px] font-semibold hover:bg-secondary"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Reading Streak Badge ─────────────────────────────────────────────────────

function StreakBadge({ streak }: { streak: number }) {
  if (streak < 2) return null;
  return (
    <span
      title={`${streak}-day reading streak`}
      className="inline-flex items-center gap-1 rounded-full border border-orange-400/40 bg-orange-500/10 px-2 py-0.5 text-[11px] font-semibold text-orange-500"
    >
      <Flame className="size-3" />
      {streak} day{streak > 1 ? "s" : ""} streak
    </span>
  );
}

// ─── "You read this X ago" badge ──────────────────────────────────────────────

function PreviousVisitBadge({ label }: { label: string }) {
  return (
    <span
      title="Your previous visit"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground"
    >
      ↩ You read this {label}
    </span>
  );
}

// ─── Main tracker component ───────────────────────────────────────────────────

export function ArticleReadingTracker({ slug, title, category }: ArticleReadingTrackerProps) {
  const [store, setStore] = useState<ReadingStore | null>(null);
  const [toastQueue, setToastQueue] = useState<BadgeDef[]>([]);
  const [showContinueBanner, setShowContinueBanner] = useState(false);
  const [savedScrollPct, setSavedScrollPct] = useState(0);
  const scrollListenerActive = useRef(false);

  // Mount: record visit, detect saved position
  useEffect(() => {
    const { store: newStore, newBadges } = recordVisit(slug, title, category);
    const savedPct = newStore.visits[slug]?.scrollPct ?? 0;
    queueMicrotask(() => {
      setStore(newStore);
      if (savedPct >= 5) {
        setSavedScrollPct(savedPct);
        setShowContinueBanner(true);
      }

      if (newBadges.length > 0) {
        const defs = newBadges
          .map((id) => ALL_BADGES.find((b) => b.id === id))
          .filter(Boolean) as BadgeDef[];
        setToastQueue((prev) => [...prev, ...defs]);
      }
    });
  }, [slug]);

  // Listen for badge events fired by saveScrollPosition
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ newBadges: string[] }>;
      const defs = ev.detail.newBadges
        .map((id) => ALL_BADGES.find((b) => b.id === id))
        .filter(Boolean) as BadgeDef[];
      if (defs.length > 0) setToastQueue((prev) => [...prev, ...defs]);
    };
    window.addEventListener("shenoylabs:new-badges", handler);
    return () => window.removeEventListener("shenoylabs:new-badges", handler);
  }, []);

  // Scroll tracking
  useEffect(() => {
    if (scrollListenerActive.current) return;
    scrollListenerActive.current = true;

    let lastSaved = 0;
    const THROTTLE_MS = 2000;

    const onScroll = () => {
      const pane = document.getElementById("reader-scroll-pane");
      let pct: number;

      if (pane && pane.scrollHeight - pane.clientHeight > 4) {
        const max = pane.scrollHeight - pane.clientHeight;
        pct = Math.min(100, Math.round((pane.scrollTop / max) * 100));
      } else {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        pct = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;
      }

      const now = Date.now();
      if (now - lastSaved > THROTTLE_MS) {
        lastSaved = now;
        saveScrollPosition(slug, pct);
        setStore(readStore());
      }
    };

    const pane = document.getElementById("reader-scroll-pane");
    window.addEventListener("scroll", onScroll, { passive: true });
    if (pane) pane.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (pane) pane.removeEventListener("scroll", onScroll);
      scrollListenerActive.current = false;
    };
  }, [slug]);

  const handleContinue = useCallback(() => {
    setShowContinueBanner(false);
    const pane = document.getElementById("reader-scroll-pane");
    if (pane) {
      pane.scrollTop = (pane.scrollHeight - pane.clientHeight) * (savedScrollPct / 100);
    } else {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: max * (savedScrollPct / 100), behavior: "smooth" });
    }
  }, [savedScrollPct]);

  const dismissToast = useCallback((idx: number) => {
    setToastQueue((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const previousVisit = store?.visits[slug];
  const visitLabel = previousVisit ? lastReadLabel(slug) : null;
  // Only show "you read this X ago" if not first visit (firstVisit < lastVisit - 5s)
  const showPreviousVisit =
    visitLabel &&
    previousVisit &&
    previousVisit.lastVisit - previousVisit.firstVisit > 5000 &&
    visitLabel !== "today";
  const streak = store?.streak.current ?? 0;

  return (
    <>
      {/* Inline status badges rendered above the article header */}
      {(showPreviousVisit || streak >= 2) && (
        <div id="reading-tracker-badges" className="mb-3 flex flex-wrap items-center gap-2">
          {showPreviousVisit && visitLabel && <PreviousVisitBadge label={visitLabel} />}
          {streak >= 2 && <StreakBadge streak={streak} />}
        </div>
      )}

      {/* Continue reading banner */}
      {showContinueBanner && (
        <ContinueBanner
          pct={savedScrollPct}
          onContinue={handleContinue}
          onDismiss={() => setShowContinueBanner(false)}
        />
      )}

      {/* Badge toast queue */}
      {toastQueue.length > 0 && (
        <BadgeToast
          badge={toastQueue[0]}
          onDismiss={() => dismissToast(0)}
        />
      )}
    </>
  );
}

// ─── Topic Mastery Bar ────────────────────────────────────────────────────────

export function TopicMasteryBar({ className }: { className?: string; category?: string }) {
  const [stats, setStats] = useState<{
    totalRead: number;
    totalCompleted: number;
    streak: number;
    badges: number;
  } | null>(null);

  useEffect(() => {
    // Compute stats only on client after mount to keep server and initial
    // client render identical (avoid hydration mismatch).
    const store = readStore();
    const visits = Object.values(store.visits);
    if (visits.length === 0) {
      queueMicrotask(() => setStats(null));
      return;
    }
    queueMicrotask(() =>
      setStats({
        totalRead: visits.length,
        totalCompleted: visits.filter((v) => v.completed).length,
        streak: store.streak.current,
        badges: store.earnedBadges.length,
      }),
    );
    // no deps — run once on mount
  }, []);

  if (!stats || stats.totalRead === 0) return null;

  const pct = stats.totalRead > 0 ? Math.round((stats.totalCompleted / stats.totalRead) * 100) : 0;

  return (
    <div className={cn("rounded-xl border border-border bg-card/60 px-4 py-3", className)}>
      <div className="mb-2 flex items-center justify-between text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        <span className="flex items-center gap-1.5">
          <Trophy className="size-3" />
          Reading Progress
        </span>
        <span className="font-mono">{stats.totalCompleted} / {stats.totalRead} completed</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        {stats.streak >= 2 && (
          <span className="flex items-center gap-1 text-orange-500">
            <Flame className="size-3" />
            {stats.streak}-day streak
          </span>
        )}
        {stats.badges > 0 && (
          <span className="flex items-center gap-1">
            <Trophy className="size-3" />
            {stats.badges} badge{stats.badges > 1 ? "s" : ""} earned
          </span>
        )}
      </div>
    </div>
  );
}
