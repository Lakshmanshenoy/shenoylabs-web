"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Share2, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ArticleTocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

// ─── Left TOC Sidebar ─────────────────────────────────────────────────────────
// Sticky left column navigation. Tracks active section on scroll and shows
// an "approaching" highlight for the upcoming section. Shown at xl+ only.

export function ArticleTocSidebar({ toc }: { toc: ArticleTocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null);
  const [approaching, setApproaching] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, Math.round((window.scrollY / h) * 100)) : 0);

      let current: string | null = null;
      let next: string | null = null;

      for (let i = 0; i < toc.length; i++) {
        const el = document.getElementById(toc[i].id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top < 150) {
          current = toc[i].id;
        } else if (!next && top < 320) {
          next = toc[i].id;
        }
      }

      if (current) setActiveId(current);
      setApproaching(next);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [toc]);

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (toc.length === 0) return null;

  const activeIndex = toc.findIndex((t) => t.id === activeId);
  const sectionLabel =
    activeIndex >= 0 ? `${activeIndex + 1} of ${toc.length}` : `— of ${toc.length}`;

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background/90 shadow-sm backdrop-blur-sm">
        {/* Panel header */}
        <div className="border-b border-border/50 px-4 pb-3 pt-4">
          <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase">
            Contents
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/50">
            Section {sectionLabel}
          </p>
        </div>

        {/* TOC nav — scrollable so very long articles don't overflow */}
        <nav className="max-h-[52vh] overflow-y-auto py-2.5 px-2">
          <ul className="space-y-0.5">
            {toc.map((item) => {
              const isActive = activeId === item.id;
              const isApproaching = approaching === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => jumpTo(item.id)}
                    className={[
                      "w-full rounded-lg py-1.5 text-left text-[11px] leading-[1.45] transition-all duration-200 ease-out",
                      item.level === 3 ? "pl-6 pr-3" : "pl-3 pr-3",
                      isActive
                        ? "bg-primary/10 font-semibold text-primary"
                        : isApproaching
                          ? "bg-secondary/60 text-foreground/75"
                          : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
                    ].join(" ")}
                  >
                    <span
                      className={`inline-block transition-transform duration-150 ${
                        isActive ? "translate-x-0.5" : ""
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Progress footer */}
        <div className="border-t border-border/50 px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[9px] font-semibold tracking-[0.14em] text-muted-foreground/50 uppercase">
              Progress
            </p>
            <p className="font-mono text-[9px] text-muted-foreground/60">{progress}%</p>
          </div>
          {/* Minimal inline progress track */}
          <div className="h-[2px] w-full overflow-hidden rounded-full bg-border/60">
            <div
              className="h-full rounded-full bg-primary/70 transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Quote / Passage Share Popover ────────────────────────────────────────────
// A user selects any passage in the article and a small share popover appears
// above the selection. Copy the raw quote or share it to X with attribution.

type QuoteState = {
  text: string;
  x: number;
  y: number;
} | null;

function QuoteSharePopover({
  quote,
  onClose,
}: {
  quote: QuoteState;
  onClose: () => void;
}) {
  if (!quote) return null;

  const copyQuote = async () => {
    await navigator.clipboard.writeText(`"${quote.text}"`);
    onClose();
  };

  const shareOnX = () => {
    const snippet =
      quote.text.length > 200 ? `${quote.text.slice(0, 200).trimEnd()}…` : quote.text;
    const tweetText = `"${snippet}"\n\n${window.location.href}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
      "_blank",
      "noopener,noreferrer",
    );
    onClose();
  };

  return (
    <div
      className="pointer-events-none fixed z-50"
      style={{ left: quote.x, top: quote.y - 10, transform: "translate(-50%, -100%)" }}
    >
      <div className="pointer-events-auto flex items-center gap-0.5 rounded-lg border border-border/80 bg-popover/95 p-1 shadow-xl backdrop-blur-md">
        <span className="max-w-[120px] truncate px-2 py-1 text-[10px] italic text-muted-foreground">
          &ldquo;{quote.text.slice(0, 36)}{quote.text.length > 36 ? "…" : ""}&rdquo;
        </span>
        <div className="mx-0.5 h-4 w-px bg-border/80" />
        <button
          onClick={copyQuote}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="Copy quote"
        >
          <Copy className="size-3" />
          Copy
        </button>
        <button
          onClick={shareOnX}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="Share on X"
        >
          <Share2 className="size-3" />
          Share
        </button>
        <button
          onClick={onClose}
          className="flex items-center justify-center rounded-md px-1.5 py-1 text-muted-foreground/50 transition-colors hover:bg-secondary hover:text-foreground"
          title="Dismiss"
        >
          <X className="size-3" />
        </button>
      </div>
      {/* Caret */}
      <div className="mx-auto mt-[-1px] h-2 w-2 rotate-45 border-b border-r border-border/70 bg-popover/95" />
    </div>
  );
}

// ─── Main Enhancements: Progress + Selection + Long-Session ───────────────────
// A small client-side sentinel that handles:
//   1. Thin top reading-progress bar
//   2. Mirroring progress % to the #reader-progress-text element in the topbar
//   3. Selection-based quote share popover (only fires inside #article-body)
//   4. Long-session typography: after 90s, sets data-long-session on #article-body
//      so CSS can gently increase line-height / paragraph spacing

export function ArticleReaderEnhancements({ toc: _toc }: { toc: ArticleTocItem[] }) {
  const [progress, setProgress] = useState(0);
  const [quote, setQuote] = useState<QuoteState>(null);
  const dismissRef = useRef<EventListener | null>(null);

  // Track scroll progress
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? Math.min(100, Math.round((window.scrollY / h) * 100)) : 0;
      setProgress(pct);
      const el = document.getElementById("reader-progress-text");
      if (el) el.textContent = `${pct}% read`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Long-session optimization: loosen typography after 90 s of dwell
  useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById("article-body")?.setAttribute("data-long-session", "true");
    }, 90_000);
    return () => clearTimeout(timer);
  }, []);

  // Selection-based quote sharing
  useEffect(() => {
    const onMouseUp = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setQuote(null);
        return;
      }
      const text = sel.toString().trim();
      if (text.length < 12 || text.length > 600) {
        setQuote(null);
        return;
      }
      const body = document.getElementById("article-body");
      if (!body) return;
      const range = sel.getRangeAt(0);
      if (!body.contains(range.commonAncestorContainer)) {
        setQuote(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      setQuote({
        text,
        x: rect.left + rect.width / 2 + window.scrollX,
        y: rect.top + window.scrollY,
      });
    };

    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, []);

  // Dismiss popover on Escape or outside click
  useEffect(() => {
    if (!quote) return;
    const handler: EventListener = (e) => {
      if ((e as KeyboardEvent).key === "Escape") setQuote(null);
    };
    document.addEventListener("keydown", handler);
    dismissRef.current = handler;
    return () => document.removeEventListener("keydown", handler);
  }, [quote]);

  return (
    <>
      {/* Thin top progress bar — minimal, no percentage text */}
      <div className="fixed inset-x-0 top-0 z-50 h-[2px] bg-border/30 pointer-events-none">
        <div
          className="h-full bg-primary/65 transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Passage share popover */}
      <QuoteSharePopover quote={quote} onClose={() => setQuote(null)} />
    </>
  );
}
