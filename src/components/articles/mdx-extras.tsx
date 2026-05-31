"use client";

/**
 * mdx-extras.tsx
 * Additional client-side MDX components:
 *  - Callout      — info / tip / warning / danger / note variants
 *  - PullQuote    — styled editorial pull quote
 *  - Spoiler      — blurred text revealed on click/hover
 *  - Expandable   — collapsible section with smooth animation
 *  - GlossaryTerm — inline term with tooltip definition
 *  - PredictionReveal — prediction prompt + blurred answer reveal
 */

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, AlertTriangle, ChevronDown, Info, Lightbulb, StickyNote } from "lucide-react";

import { cn } from "@/lib/utils";

// ─── Callout ──────────────────────────────────────────────────────────────────

type CalloutVariant = "info" | "tip" | "warning" | "danger" | "note";

const CALLOUT_STYLES: Record<CalloutVariant, {
  border: string;
  bg: string;
  icon: React.ElementType;
  iconColor: string;
  label: string;
}> = {
  info: {
    border: "border-blue-400/50",
    bg: "bg-blue-500/[0.06]",
    icon: Info,
    iconColor: "text-blue-500",
    label: "Info",
  },
  tip: {
    border: "border-green-400/50",
    bg: "bg-green-500/[0.06]",
    icon: Lightbulb,
    iconColor: "text-green-500",
    label: "Tip",
  },
  warning: {
    border: "border-yellow-400/50",
    bg: "bg-yellow-500/[0.06]",
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
    label: "Warning",
  },
  danger: {
    border: "border-red-400/50",
    bg: "bg-red-500/[0.06]",
    icon: AlertCircle,
    iconColor: "text-red-500",
    label: "Danger",
  },
  note: {
    border: "border-purple-400/50",
    bg: "bg-purple-500/[0.06]",
    icon: StickyNote,
    iconColor: "text-purple-500",
    label: "Note",
  },
};

type CalloutProps = {
  variant?: CalloutVariant;
  title?: string;
  children?: React.ReactNode;
  className?: string;
};

export function Callout({ variant = "info", title, children, className }: CalloutProps) {
  const style = CALLOUT_STYLES[variant];
  const Icon = style.icon;

  return (
    <aside
      className={cn(
        "not-prose my-6 rounded-xl border px-5 py-4",
        style.border,
        style.bg,
        className,
      )}
      role="note"
    >
      <p className={cn("mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase", style.iconColor)}>
        <Icon className="size-3.5" aria-hidden="true" />
        {title ?? style.label}
      </p>
      <div className="text-sm leading-7 text-foreground/85 [&>p]:mb-2 [&>p:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}

// ─── PullQuote ────────────────────────────────────────────────────────────────

type PullQuoteProps = {
  attribution?: string;
  children?: React.ReactNode;
  className?: string;
};

export function PullQuote({ attribution, children, className }: PullQuoteProps) {
  return (
    <blockquote
      className={cn(
        "not-prose my-8 border-l-4 border-primary/70 py-1 pl-6",
        className,
      )}
    >
      <p className="font-body text-xl font-medium italic leading-relaxed text-foreground/90 sm:text-2xl">
        {children}
      </p>
      {attribution && (
        <footer className="mt-3 text-sm font-semibold tracking-[0.06em] text-muted-foreground">
          — {attribution}
        </footer>
      )}
    </blockquote>
  );
}

// ─── Spoiler ──────────────────────────────────────────────────────────────────

type SpoilerProps = {
  label?: string;
  children?: React.ReactNode;
  className?: string;
};

export function Spoiler({ label = "Reveal spoiler", children, className }: SpoilerProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <span
      className={cn("not-prose relative inline-block w-full", className)}
    >
      <span
        className={cn(
          "block rounded-lg transition-[filter] duration-300",
          !revealed && "cursor-pointer select-none blur-sm",
        )}
        onClick={() => setRevealed(true)}
        onKeyDown={(e) => e.key === "Enter" && setRevealed(true)}
        role={!revealed ? "button" : undefined}
        tabIndex={!revealed ? 0 : undefined}
        aria-label={!revealed ? label : undefined}
      >
        {children}
      </span>

      {!revealed && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-muted/30 text-xs font-semibold text-muted-foreground backdrop-blur-[1px] hover:bg-muted/40"
        >
          👁 {label}
        </button>
      )}
    </span>
  );
}

// ─── Expandable ───────────────────────────────────────────────────────────────

type ExpandableProps = {
  summary: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
  className?: string;
};

export function Expandable({ summary, defaultOpen = false, children, className }: ExpandableProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.style.height = open ? `${bodyRef.current.scrollHeight}px` : "0px";
  }, [open]);

  return (
    <div className={cn("not-prose my-5 rounded-xl border border-border/70 bg-card/50", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left text-sm font-semibold text-foreground/90 hover:text-foreground"
      >
        <span>{summary}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        ref={bodyRef}
        style={{ height: defaultOpen ? undefined : "0px" }}
        className="overflow-hidden transition-[height] duration-300 ease-in-out"
        aria-hidden={!open}
      >
        <div className="border-t border-border/60 px-5 py-4 text-sm leading-7 text-foreground/85 [&>p]:mb-3 [&>p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── GlossaryTerm ─────────────────────────────────────────────────────────────

type GlossaryTermProps = {
  term: string;
  definition: string;
  children?: React.ReactNode;
  className?: string;
};

export function GlossaryTerm({ term, definition, children, className }: GlossaryTermProps) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!visible) return;
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [visible]);

  return (
    <span ref={containerRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        aria-describedby={visible ? `glossary-${term}` : undefined}
        className="cursor-help border-b border-dashed border-primary/60 text-inherit hover:border-primary"
      >
        {children ?? term}
      </button>

      {visible && (
        <span
          id={`glossary-${term}`}
          role="tooltip"
          className="animate-in fade-in absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-xl border border-border bg-popover px-3 py-2.5 text-[12px] leading-relaxed text-foreground shadow-xl"
        >
          <strong className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            {term}
          </strong>
          {definition}
          {/* Caret */}
          <span className="absolute bottom-[-5px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-border bg-popover" />
        </span>
      )}
    </span>
  );
}

// ─── PredictionReveal ─────────────────────────────────────────────────────────

type PredictionRevealProps = {
  prompt: string;
  answer: string;
  className?: string;
};

export function PredictionReveal({ prompt, answer, className }: PredictionRevealProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <aside className={cn("not-prose my-7 rounded-xl border border-border/70 bg-secondary/30 px-5 py-4", className)}>
      <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        🔮 Prediction Prompt
      </p>
      <p className="mb-4 font-heading text-base font-semibold text-foreground">{prompt}</p>

      {revealed ? (
        <div className="animate-in fade-in rounded-lg border border-border bg-background/60 px-4 py-3 text-sm leading-7 text-foreground/85">
          {answer}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="rounded-lg border border-dashed border-border/70 bg-muted/40 px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          Reveal answer →
        </button>
      )}
    </aside>
  );
}
