"use client";

import { useEffect, useState } from "react";
import { Eye, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

export type JourneyArticleMeta = {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  readingTimeMinutes: number;
  date: string;
  featured?: boolean;
};

type ReadingPrefs = {
  width: "narrow" | "medium" | "wide";
  typography: "editorial" | "modern" | "classic";
  density: "relaxed" | "balanced" | "focused";
  theme: "library" | "study" | "night" | "paper";
  deepFocus: boolean;
};

const STATE_KEY = "shenoylabs:reading-experience:v1";

const DEFAULT_PREFS: ReadingPrefs = {
  width: "medium",
  typography: "editorial",
  density: "balanced",
  theme: "library",
  deepFocus: false,
};

function readPrefs(): ReadingPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<ReadingPrefs>;
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
}

function writePrefs(prefs: ReadingPrefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STATE_KEY, JSON.stringify(prefs));
}

function applyPrefsToDocument(prefs: ReadingPrefs) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.setAttribute("data-reader-width", prefs.width);
  root.setAttribute("data-reader-typography", prefs.typography);
  root.setAttribute("data-reader-density", prefs.density);
  root.setAttribute("data-reader-theme", prefs.theme);
  root.setAttribute("data-reader-focus", prefs.deepFocus ? "true" : "false");

  const article = document.getElementById("article-body");
  if (article) {
    article.setAttribute("data-reader-width", prefs.width);
    article.setAttribute("data-reader-typography", prefs.typography);
    article.setAttribute("data-reader-density", prefs.density);
    article.setAttribute("data-reader-theme", prefs.theme);
  }
}

type DetailProps = {
  allArticles?: JourneyArticleMeta[];
  currentArticle?: JourneyArticleMeta;
  toc?: Array<{ id: string; title: string; level: 2 | 3 }>;
  relatedSlugs?: string[];
  recommendedSlugs?: string[];
};

export function ArticleGamifiedExperience({}: DetailProps) {
  const [prefs, setPrefs] = useState<ReadingPrefs>(() => readPrefs());

  useEffect(() => {
    applyPrefsToDocument(prefs);
    writePrefs(prefs);
  }, [prefs]);

  return (
    <section className="sticky top-[3.4rem] z-20 mb-4 rounded-xl border border-border/70 bg-background/88 p-3 backdrop-blur-sm md:static md:z-auto">
      <div className="flex flex-wrap items-start gap-3 md:items-end">
        <div className="min-w-[10rem] grow pr-2">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            <SlidersHorizontal className="size-3.5" />
            Reading Experience
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Full controls on mobile and desktop: width, typography, density, theme, and deep focus.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPrefs((prev) => ({ ...prev, deepFocus: !prev.deepFocus }))}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[10px] font-semibold tracking-[0.08em] uppercase",
            prefs.deepFocus ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground",
          )}
          aria-pressed={prefs.deepFocus}
        >
          <Eye className="size-3" />
          Deep Focus
        </button>

        <div className="flex w-full flex-wrap gap-1.5 md:hidden">
          <ValuePill label="Width" value={prefs.width} />
          <ValuePill label="Typography" value={prefs.typography} />
          <ValuePill label="Density" value={prefs.density} />
          <ValuePill label="Theme" value={prefs.theme} />
        </div>

        <div className="w-full space-y-2 md:hidden">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            <button
              type="button"
              onClick={() => setPrefs(DEFAULT_PREFS)}
              className="h-8 shrink-0 rounded-md border border-border px-2.5 text-[10px] font-semibold tracking-[0.08em] uppercase"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() =>
                setPrefs((prev) => ({
                  ...prev,
                  width: "narrow",
                  density: "relaxed",
                  typography: "editorial",
                }))
              }
              className="h-8 shrink-0 rounded-md border border-border px-2.5 text-[10px] font-semibold tracking-[0.08em] uppercase"
            >
              Comfort Preset
            </button>
            <button
              type="button"
              onClick={() =>
                setPrefs((prev) => ({
                  ...prev,
                  width: "medium",
                  density: "focused",
                  typography: "modern",
                }))
              }
              className="h-8 shrink-0 rounded-md border border-border px-2.5 text-[10px] font-semibold tracking-[0.08em] uppercase"
            >
              Focus Preset
            </button>
          </div>

          <MobileOptionGroup
            label="Width"
            value={prefs.width}
            options={["narrow", "medium", "wide"]}
            onChange={(value) => setPrefs((prev) => ({ ...prev, width: value as ReadingPrefs["width"] }))}
          />

          <MobileOptionGroup
            label="Typography"
            value={prefs.typography}
            options={["editorial", "modern", "classic"]}
            onChange={(value) => setPrefs((prev) => ({ ...prev, typography: value as ReadingPrefs["typography"] }))}
          />

          <MobileOptionGroup
            label="Density"
            value={prefs.density}
            options={["relaxed", "balanced", "focused"]}
            onChange={(value) => setPrefs((prev) => ({ ...prev, density: value as ReadingPrefs["density"] }))}
          />

          <MobileOptionGroup
            label="Theme"
            value={prefs.theme}
            options={["library", "study", "night", "paper"]}
            onChange={(value) => setPrefs((prev) => ({ ...prev, theme: value as ReadingPrefs["theme"] }))}
          />
        </div>

        <div className="hidden w-full flex-wrap items-end gap-3 md:flex">
          <Picker
            label="Width"
            value={prefs.width}
            options={["narrow", "medium", "wide"]}
            onChange={(value) => setPrefs((prev) => ({ ...prev, width: value as ReadingPrefs["width"] }))}
          />

          <Picker
            label="Typography"
            value={prefs.typography}
            options={["editorial", "modern", "classic"]}
            onChange={(value) => setPrefs((prev) => ({ ...prev, typography: value as ReadingPrefs["typography"] }))}
          />

          <Picker
            label="Density"
            value={prefs.density}
            options={["relaxed", "balanced", "focused"]}
            onChange={(value) => setPrefs((prev) => ({ ...prev, density: value as ReadingPrefs["density"] }))}
          />

          <Picker
            label="Theme"
            value={prefs.theme}
            options={["library", "study", "night", "paper"]}
            onChange={(value) => setPrefs((prev) => ({ ...prev, theme: value as ReadingPrefs["theme"] }))}
          />
        </div>
      </div>
    </section>
  );
}

export function ArticlesJourneyOverview() {
  return null;
}

function Picker({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={cn("space-y-1", className)}>
      <span className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full min-w-[8.5rem] rounded-md border border-border bg-background px-2 text-[11px]"
      >
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}

function ValuePill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-border/70 bg-secondary/45 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase">
      {label}: {value}
    </span>
  );
}

function MobileOptionGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-md border border-border/70 bg-background/70 p-2">
      <p className="mb-1.5 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{label}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "min-h-9 rounded-md border px-2 py-1 text-[10px] font-semibold tracking-[0.06em] uppercase",
                selected
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-background text-muted-foreground",
              )}
              aria-pressed={selected}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
