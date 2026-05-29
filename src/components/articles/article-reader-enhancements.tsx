"use client";

import { useEffect, useState } from "react";
import {
  Clock3,
  Copy,
  Gauge,
  ListTree,
  Pencil,
  X,
} from "lucide-react";

import {
  LinkedInBrandIcon,
  TelegramBrandIcon,
  WhatsAppBrandIcon,
  XBrandIcon,
} from "@/components/shared/social-brand-icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ArticleTocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

const SCROLL_PANE_ID = "reader-scroll-pane";

type ScrollState = {
  progress: number;
  thresholdCurrent: number;
  thresholdUpcoming: number;
};

function getScrollPane(): HTMLElement | null {
  return document.getElementById(SCROLL_PANE_ID);
}

function isPaneScrollable(pane: HTMLElement | null): pane is HTMLElement {
  return Boolean(pane && pane.scrollHeight - pane.clientHeight > 4);
}

function getScrollState(): ScrollState {
  const pane = getScrollPane();
  if (isPaneScrollable(pane)) {
    const max = pane.scrollHeight - pane.clientHeight;
    const progress = max > 0 ? Math.min(100, Math.round((pane.scrollTop / max) * 100)) : 0;
    const paneTop = pane.getBoundingClientRect().top;
    return {
      progress,
      thresholdCurrent: paneTop + 120,
      thresholdUpcoming: paneTop + 320,
    };
  }

  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;
  return {
    progress,
    thresholdCurrent: 120,
    thresholdUpcoming: 320,
  };
}

function bindScrollListeners(onScroll: () => void) {
  const pane = getScrollPane();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  if (pane) {
    pane.addEventListener("scroll", onScroll, { passive: true });
  }
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (pane) {
      pane.removeEventListener("scroll", onScroll);
    }
  };
}

function getProgressTone(progress: number): "yellow" | "amber" | "red" | "green" {
  if (progress >= 100) return "green";
  if (progress > 40) return "red";
  if (progress > 20) return "amber";
  return "yellow";
}

function getMinutesLeft(readingTimeMinutes: number, progress: number): number {
  if (progress >= 100) return 0;
  return Math.max(1, Math.ceil((readingTimeMinutes * (100 - progress)) / 100));
}

export function MobileTocSheet({ toc }: { toc: ArticleTocItem[] }) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null);

  useEffect(() => {
    const onScroll = () => {
      const { thresholdCurrent } = getScrollState();
      let current: string | null = null;

      for (const item of toc) {
        const section = document.getElementById(item.id);
        if (!section) continue;
        if (section.getBoundingClientRect().top < thresholdCurrent) current = item.id;
      }

      if (current) setActiveId(current);
    };

    onScroll();
    return bindScrollListeners(onScroll);
  }, [toc]);

  if (toc.length === 0) return null;

  const activeIndex = toc.findIndex((item) => item.id === activeId);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="xl:hidden"
          />
        }
      >
        <ListTree className="size-3.5" />
        TOC
      </SheetTrigger>
      <SheetContent side="left" className="w-[84vw] max-w-xs p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle>Contents</SheetTitle>
          <p className="text-[11px] text-muted-foreground">
            {activeIndex >= 0 ? `Section ${activeIndex + 1} of ${toc.length}` : `${toc.length} sections`}
          </p>
        </SheetHeader>

        <nav className="max-h-[calc(100vh-5rem)] overflow-y-auto px-3 py-3" aria-label="Article table of contents">
          <ul className="space-y-1">
            {toc.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      setOpen(false);
                    }}
                    className={[
                      "w-full rounded-lg py-2 text-left text-[13px] leading-[1.45] transition-colors",
                      item.level === 3 ? "pl-6 pr-3" : "pl-3 pr-3",
                      isActive
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                    ].join(" ")}
                  >
                    {item.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

// ─── Left TOC Sidebar ─────────────────────────────────────────────────────────
// Sticky left column navigation. Tracks active section on scroll and shows
// an "approaching" highlight for the upcoming section. Shown at xl+ only.

export function ArticleTocSidebar({ toc }: { toc: ArticleTocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null);
  const [approaching, setApproaching] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const { progress, thresholdCurrent, thresholdUpcoming } = getScrollState();
      setProgress(progress);

      let current: string | null = null;
      let next: string | null = null;

      for (let i = 0; i < toc.length; i++) {
        const el = document.getElementById(toc[i].id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top < thresholdCurrent) {
          current = toc[i].id;
        } else if (!next && top < thresholdUpcoming) {
          next = toc[i].id;
        }
      }

      if (current) setActiveId(current);
      setApproaching(next);
    };

    onScroll();
    return bindScrollListeners(onScroll);
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
      <div className="sticky top-24 flex w-fit min-w-[18rem] max-w-[30vw] flex-col overflow-hidden rounded-xl border border-border/60 bg-background/90 shadow-sm backdrop-blur-sm">
        {/* Panel header */}
        <div className="border-b border-border/50 px-4 pb-3 pt-4">
          <p className="text-[11px] font-semibold tracking-[0.15em] text-muted-foreground/65 uppercase">
            Contents
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/55">
            Section {sectionLabel}
          </p>
        </div>

        {/* TOC nav — scrollable so very long articles don't overflow */}
        <nav className="max-h-[56vh] overflow-y-auto px-2 py-2.5">
          <ul className="space-y-0.5">
            {toc.map((item) => {
              const isActive = activeId === item.id;
              const isApproaching = approaching === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => jumpTo(item.id)}
                    className={[
                      "w-full rounded-lg py-2 text-left text-[13px] leading-[1.52] transition-all duration-200 ease-out",
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
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/55 uppercase">
              Progress
            </p>
            <p className="font-mono text-[10px] text-muted-foreground/65">{progress}%</p>
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

  const shareText = () => {
    const snippet =
      quote.text.length > 220 ? `${quote.text.slice(0, 220).trimEnd()}...` : quote.text;
    return `"${snippet}"\n\n${window.location.href}`;
  };

  const shareOnX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText())}`,
      "_blank",
      "noopener,noreferrer",
    );
    onClose();
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      "_blank",
      "noopener,noreferrer",
    );
    onClose();
  };

  const shareOnWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText())}`,
      "_blank",
      "noopener,noreferrer",
    );
    onClose();
  };

  const shareOnTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(
        quote.text,
      )}`,
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
          className="flex items-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="Share on X"
          aria-label="Share on X"
        >
          <XBrandIcon className="size-3.5" />
        </button>
        <button
          onClick={shareOnLinkedIn}
          className="flex items-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="Share on LinkedIn"
          aria-label="Share on LinkedIn"
        >
          <LinkedInBrandIcon className="size-3.5" />
        </button>
        <button
          onClick={shareOnWhatsApp}
          className="flex items-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="Share on WhatsApp"
          aria-label="Share on WhatsApp"
        >
          <WhatsAppBrandIcon className="size-3.5" />
        </button>
        <button
          onClick={shareOnTelegram}
          className="flex items-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="Share on Telegram"
          aria-label="Share on Telegram"
        >
          <TelegramBrandIcon className="size-3.5" />
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

export function ArticleReaderEnhancements({
  toc,
  readingTimeMinutes,
  createdDateLabel,
  updatedDateLabel,
  versionLabel,
  versionSummary,
}: {
  toc: ArticleTocItem[];
  readingTimeMinutes: number;
  createdDateLabel: string;
  updatedDateLabel: string;
  versionLabel: string;
  versionSummary: string;
}) {
  const [progress, setProgress] = useState(0);
  const [quote, setQuote] = useState<QuoteState>(null);
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null);

  // Track scroll progress
  useEffect(() => {
    const onScroll = () => {
      const { progress: pct, thresholdCurrent } = getScrollState();
      setProgress(pct);

      const minutesLeft = getMinutesLeft(readingTimeMinutes, pct);
      const el = document.getElementById("reader-progress-text");
      if (el) {
        el.textContent = `${pct}% · ${minutesLeft}m left`;
        el.setAttribute("data-tone", getProgressTone(pct));
      }

      let current: string | null = null;
      for (const item of toc) {
        const section = document.getElementById(item.id);
        if (!section) continue;
        if (section.getBoundingClientRect().top < thresholdCurrent) current = item.id;
      }
      if (current) setActiveId(current);
    };

    onScroll();
    return bindScrollListeners(onScroll);
  }, [toc, readingTimeMinutes]);

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
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuote(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [quote]);

  const minutesLeft = getMinutesLeft(readingTimeMinutes, progress);
  const currentSection = toc.find((item) => item.id === activeId);
  const sectionIndex = activeId ? toc.findIndex((item) => item.id === activeId) + 1 : 0;

  return (
    <>
      {/* Floating reading HUD */}
      <aside className="fixed bottom-5 right-5 z-40 hidden w-[16.5rem] rounded-xl border border-border/70 bg-background/95 p-3 shadow-lg backdrop-blur sm:block">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Reading status
          </p>
          <Gauge className="size-3.5 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock3 className="size-3.5" />
              Minutes left
            </span>
            <span className="font-mono text-[12px] text-foreground">{minutesLeft} min read</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Read</span>
            <span className="font-mono text-[12px] text-foreground">{progress}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ListTree className="size-3.5" />
              Section
            </span>
            <span className="font-mono text-[12px] text-foreground">
              {sectionIndex > 0 ? `${sectionIndex}/${toc.length}` : `0/${toc.length}`}
            </span>
          </div>
          {currentSection ? (
            <p className="line-clamp-2 rounded-md bg-secondary/65 px-2 py-1.5 text-[10px] leading-relaxed text-foreground/80">
              {currentSection.title}
            </p>
          ) : null}

          <div className="mt-2 space-y-1 rounded-md border border-border/60 bg-secondary/35 px-2 py-2">
            <p className="text-[9px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Version
            </p>
            <p className="font-mono text-[11px] text-foreground">{versionLabel}</p>
            <p className="text-[10px] leading-relaxed text-muted-foreground">{versionSummary}</p>
            <div className="pt-1 text-[10px] text-muted-foreground/80">
              <p>Created: {createdDateLabel}</p>
              <p>Updated: {updatedDateLabel}</p>
            </div>
          </div>

          <p className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground/75">
            <Pencil className="size-3" />
            Content-aware article status
          </p>
        </div>
      </aside>

      {/* Passage share popover */}
      <QuoteSharePopover quote={quote} onClose={() => setQuote(null)} />
    </>
  );
}
