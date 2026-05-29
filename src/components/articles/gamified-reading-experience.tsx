"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Brain,
  Compass,
  Crown,
  Eye,
  Flame,
  Gem,
  Globe2,
  Lock,
  Map,
  Mountain,
  Music2,
  ScrollText,
  Sparkles,
  Swords,
  Target,
  Trophy,
  WandSparkles,
  X,
} from "lucide-react";

import type { ArticleTocItem } from "@/components/articles/article-reader-enhancements";
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

type ConceptState = "hidden" | "seen" | "mastered";

type ConceptEntry = {
  state: ConceptState;
  seenCount: number;
  category: string;
  lastSeen: string;
};

type VisitEntry = {
  visits: number;
  firstSeenAt: string;
  lastSeenAt: string;
};

type WorldProgress = {
  visited: number;
  completed: number;
};

type PathwayProgress = {
  visited: number;
  completed: number;
};

type JourneyEvent = {
  id: string;
  kind: "article" | "concept" | "world" | "pathway" | "achievement" | "quest" | "secret";
  message: string;
  at: string;
};

type ReadingPrefs = {
  width: "narrow" | "medium" | "wide";
  typography: "editorial" | "modern" | "classic";
  density: "relaxed" | "balanced" | "focused";
  theme: "library" | "study" | "night" | "paper";
  deepFocus: boolean;
  ambient: "off" | "rain" | "fireplace" | "ocean" | "library";
};

type JourneyState = {
  version: 1;
  xp: number;
  totalMinutesRead: number;
  visitsByArticle: Record<string, VisitEntry>;
  completedArticles: string[];
  completedCanonQuests: string[];
  completedSectionsByArticle: Record<string, string[]>;
  concepts: Record<string, ConceptEntry>;
  worlds: Record<string, WorldProgress>;
  pathways: Record<string, PathwayProgress>;
  achievements: string[];
  unlockedSecrets: string[];
  events: JourneyEvent[];
  prefs: ReadingPrefs;
};

type Challenge = {
  id: string;
  label: string;
  target: number;
  value: number;
  description: string;
};

const STATE_KEY = "shenoylabs:article-journey:v1";
const MAX_EVENTS = 120;
const DEFAULT_PREFS: ReadingPrefs = {
  width: "medium",
  typography: "editorial",
  density: "balanced",
  theme: "library",
  deepFocus: false,
  ambient: "off",
};

const LEVELS = [
  "Visitor",
  "Explorer",
  "Researcher",
  "Thinker",
  "Analyst",
  "Strategist",
  "Architect",
  "Polymath",
] as const;

const ACHIEVEMENTS: Array<{ id: string; label: string; check: (s: JourneyState) => boolean }> = [
  {
    id: "first-investigation",
    label: "First Investigation",
    check: (s) => s.completedArticles.length >= 1,
  },
  {
    id: "deep-diver",
    label: "Deep Diver",
    check: (s) => s.totalMinutesRead >= 120,
  },
  {
    id: "systems-thinker",
    label: "Systems Thinker",
    check: (s) => Object.keys(s.worlds).length >= 4,
  },
  {
    id: "concept-hunter",
    label: "Concept Hunter",
    check: (s) => Object.values(s.concepts).filter((v) => v.state !== "hidden").length >= 40,
  },
];

const SOUND_PROFILES: Record<Exclude<ReadingPrefs["ambient"], "off">, { base: number; lfo: number; gain: number }> = {
  rain: { base: 210, lfo: 2.8, gain: 0.016 },
  fireplace: { base: 120, lfo: 0.8, gain: 0.02 },
  ocean: { base: 85, lfo: 0.35, gain: 0.02 },
  library: { base: 280, lfo: 0.12, gain: 0.012 },
};

function readState(): JourneyState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as JourneyState;
    return {
      ...initialState(),
      ...parsed,
      prefs: { ...DEFAULT_PREFS, ...parsed.prefs },
    };
  } catch {
    return initialState();
  }
}

function initialState(): JourneyState {
  return {
    version: 1,
    xp: 0,
    totalMinutesRead: 0,
    visitsByArticle: {},
    completedArticles: [],
    completedCanonQuests: [],
    completedSectionsByArticle: {},
    concepts: {},
    worlds: {},
    pathways: {},
    achievements: [],
    unlockedSecrets: [],
    events: [],
    prefs: DEFAULT_PREFS,
  };
}

function writeState(next: JourneyState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STATE_KEY, JSON.stringify(next));
}

function readingLevel(xp: number) {
  const index = Math.min(LEVELS.length - 1, Math.floor(xp / 320));
  return {
    index,
    label: LEVELS[index],
    currentLevelFloor: index * 320,
    nextLevelAt: (index + 1) * 320,
  };
}

function normalizeConcept(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildConceptSeed(tags: string[], toc: ArticleTocItem[]) {
  return Array.from(new Set([...tags, ...toc.map((item) => item.title)])).map(normalizeConcept).filter(Boolean);
}

function pushEvent(state: JourneyState, event: Omit<JourneyEvent, "id" | "at">): JourneyState {
  const item: JourneyEvent = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    at: new Date().toISOString(),
    ...event,
  };
  return {
    ...state,
    events: [item, ...state.events].slice(0, MAX_EVENTS),
  };
}

function upsertConcept(state: JourneyState, concept: string, category: string, mastered = false): JourneyState {
  const existing = state.concepts[concept];
  const seenCount = (existing?.seenCount ?? 0) + 1;
  const nextState: ConceptState = mastered || seenCount >= 3 ? "mastered" : "seen";
  return {
    ...state,
    concepts: {
      ...state.concepts,
      [concept]: {
        state: nextState,
        seenCount,
        category,
        lastSeen: new Date().toISOString(),
      },
    },
  };
}

function uniqueCount<T>(values: T[]) {
  return new Set(values).size;
}

function buildChallenges(state: JourneyState, allArticles: JourneyArticleMeta[]): Challenge[] {
  const totalSystemsArticles = allArticles.filter((a) => a.category.toLowerCase().includes("system")).length;
  const infrastructureArticles = allArticles.filter(
    (a) =>
      a.category.toLowerCase().includes("infrastructure") ||
      a.tags.some((tag) => tag.toLowerCase().includes("infrastructure")),
  );

  return [
    {
      id: "systems-5",
      label: "Systems Apprentice",
      description: "Complete 5 Systems investigations",
      target: Math.min(5, Math.max(1, totalSystemsArticles || 5)),
      value: allArticles.filter((a) => state.completedArticles.includes(a.slug) && a.category.toLowerCase().includes("system")).length,
    },
    {
      id: "infra-world",
      label: "Infrastructure Cartographer",
      description: "Complete all Infrastructure investigations",
      target: Math.max(1, infrastructureArticles.length),
      value: infrastructureArticles.filter((a) => state.completedArticles.includes(a.slug)).length,
    },
    {
      id: "concept-100",
      label: "Concept Harvester",
      description: "Discover 100 concepts",
      target: 100,
      value: Object.values(state.concepts).filter((item) => item.state !== "hidden").length,
    },
  ];
}

function buildCanonQuestSlugs(allArticles: JourneyArticleMeta[]): string[] {
  return [...allArticles]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, Math.min(6, allArticles.length))
    .map((item) => item.slug);
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

function useAmbientSoundscape(mode: ReadingPrefs["ambient"]) {
  const teardownRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    teardownRef.current?.();
    teardownRef.current = null;

    if (mode === "off") return;
    if (typeof window === "undefined") return;

    const profile = SOUND_PROFILES[mode];
    const ctx = new window.AudioContext();
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = mode === "fireplace" ? "sawtooth" : mode === "library" ? "triangle" : "sine";
    osc.frequency.value = profile.base;

    lfo.type = "sine";
    lfo.frequency.value = profile.lfo;
    lfoGain.gain.value = profile.base * 0.18;

    filter.type = mode === "ocean" ? "lowpass" : "bandpass";
    filter.frequency.value = mode === "ocean" ? 520 : 720;
    filter.Q.value = mode === "library" ? 0.35 : 0.8;

    gain.gain.value = profile.gain;

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    lfo.start();

    teardownRef.current = () => {
      try {
        lfo.stop();
        osc.stop();
      } catch {
        // no-op: nodes may already be stopped if effect is cleaned quickly
      }
      ctx.close().catch(() => undefined);
    };

    return () => {
      teardownRef.current?.();
      teardownRef.current = null;
    };
  }, [mode]);
}

function toggleInArray(values: string[], value: string) {
  return values.includes(value) ? values : [...values, value];
}

function initializeDetailState(currentArticle: JourneyArticleMeta, toc: ArticleTocItem[]) {
  const loaded = readState();
  const now = new Date().toISOString();
  const visit = loaded.visitsByArticle[currentArticle.slug];
  const nextVisit: VisitEntry = visit
    ? { ...visit, visits: visit.visits + 1, lastSeenAt: now }
    : { visits: 1, firstSeenAt: now, lastSeenAt: now };

  let next: JourneyState = {
    ...loaded,
    visitsByArticle: {
      ...loaded.visitsByArticle,
      [currentArticle.slug]: nextVisit,
    },
    worlds: {
      ...loaded.worlds,
      [currentArticle.category]: {
        visited: Math.max(loaded.worlds[currentArticle.category]?.visited ?? 0, 1),
        completed: loaded.worlds[currentArticle.category]?.completed ?? 0,
      },
    },
  };

  next = pushEvent(next, {
    kind: "article",
    message: `Entered investigation: ${currentArticle.title}`,
  });

  const revisitAfterDays = Math.floor(
    (new Date(nextVisit.lastSeenAt).getTime() - new Date(nextVisit.firstSeenAt).getTime()) / 86400000,
  );
  if (nextVisit.visits >= 2 && revisitAfterDays >= 3 && !next.unlockedSecrets.includes(`revisit:${currentArticle.slug}`)) {
    next = {
      ...next,
      unlockedSecrets: [...next.unlockedSecrets, `revisit:${currentArticle.slug}`],
      xp: next.xp + 28,
    };
    next = pushEvent(next, {
      kind: "secret",
      message: `Revisit reward unlocked for ${currentArticle.title}`,
    });
  }

  const seed = buildConceptSeed(currentArticle.tags, toc).slice(0, 8);
  for (const concept of seed) {
    next = upsertConcept(next, concept, currentArticle.category, false);
  }

  return next;
}

type BaseProps = {
  allArticles: JourneyArticleMeta[];
};

type DetailProps = BaseProps & {
  currentArticle: JourneyArticleMeta;
  toc: ArticleTocItem[];
  relatedSlugs: string[];
  recommendedSlugs: string[];
};

export function ArticleGamifiedExperience({
  allArticles,
  currentArticle,
  toc,
  relatedSlugs,
  recommendedSlugs,
}: DetailProps) {
  const [open, setOpen] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [state, setState] = useState<JourneyState>(() => initializeDetailState(currentArticle, toc));
  const canonQuestSlugs = useMemo(() => buildCanonQuestSlugs(allArticles), [allArticles]);

  useAmbientSoundscape(state.prefs.ambient);

  useEffect(() => {
    applyPrefsToDocument(state.prefs);
    writeState(state);
  }, [state]);

  useEffect(() => {
    const sectionIds = toc.map((item) => item.id);
    if (sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setState((prev) => {
          let next = prev;
          let changed = false;

          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const sectionId = entry.target.getAttribute("id");
            if (!sectionId) continue;

            const completedForArticle = next.completedSectionsByArticle[currentArticle.slug] ?? [];
            if (completedForArticle.includes(sectionId)) continue;

            next = {
              ...next,
              completedSectionsByArticle: {
                ...next.completedSectionsByArticle,
                [currentArticle.slug]: [...completedForArticle, sectionId],
              },
              xp: next.xp + 12,
            };

            const tocTitle = toc.find((t) => t.id === sectionId)?.title;
            if (tocTitle) {
              next = upsertConcept(next, normalizeConcept(tocTitle), currentArticle.category);
            }
            changed = true;
          }

          if (!changed) return prev;

          const completedSections = next.completedSectionsByArticle[currentArticle.slug] ?? [];
          const pct = Math.round((completedSections.length / Math.max(1, toc.length)) * 100);
          if (
            pct >= 100 &&
            !next.completedArticles.includes(currentArticle.slug)
          ) {
            next = {
              ...next,
              completedArticles: toggleInArray(next.completedArticles, currentArticle.slug),
              xp: next.xp + Math.max(80, currentArticle.readingTimeMinutes * 4),
              totalMinutesRead: next.totalMinutesRead + currentArticle.readingTimeMinutes,
            };
            next = pushEvent(next, {
              kind: "article",
              message: `Completed investigation: ${currentArticle.title}`,
            });

            const world = next.worlds[currentArticle.category] ?? { visited: 0, completed: 0 };
            next = {
              ...next,
              worlds: {
                ...next.worlds,
                [currentArticle.category]: {
                  visited: Math.max(1, world.visited),
                  completed: world.completed + 1,
                },
              },
            };

            for (const pathway of currentArticle.tags.slice(0, 2)) {
              const path = next.pathways[pathway] ?? { visited: 0, completed: 0 };
              next = {
                ...next,
                pathways: {
                  ...next.pathways,
                  [pathway]: {
                    visited: Math.max(1, path.visited),
                    completed: path.completed + 1,
                  },
                },
              };
            }
          }

          return unlockAchievements(next);
        });
      },
      { threshold: 0.72 },
    );

    for (const id of sectionIds) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }

    return () => observer.disconnect();
  }, [currentArticle.category, currentArticle.readingTimeMinutes, currentArticle.slug, currentArticle.tags, currentArticle.title, toc]);

  const level = readingLevel(state.xp);
  const levelProgress = Math.min(
    100,
    Math.round(((state.xp - level.currentLevelFloor) / Math.max(1, level.nextLevelAt - level.currentLevelFloor)) * 100),
  );

  const discoveredConcepts = Object.entries(state.concepts)
    .filter(([, value]) => value.state !== "hidden")
    .sort((a, b) => b[1].lastSeen.localeCompare(a[1].lastSeen));
  const masteredConcepts = discoveredConcepts.filter(([, value]) => value.state === "mastered").length;

  const worldCompletion = allArticles.reduce<Record<string, { total: number; completed: number }>>((acc, article) => {
    const bucket = acc[article.category] ?? { total: 0, completed: 0 };
    bucket.total += 1;
    if (state.completedArticles.includes(article.slug)) bucket.completed += 1;
    acc[article.category] = bucket;
    return acc;
  }, {});

  const pathwayCompletion = allArticles.reduce<Record<string, { total: number; completed: number }>>((acc, article) => {
    for (const tag of article.tags.slice(0, 2)) {
      const bucket = acc[tag] ?? { total: 0, completed: 0 };
      bucket.total += 1;
      if (state.completedArticles.includes(article.slug)) bucket.completed += 1;
      acc[tag] = bucket;
    }
    return acc;
  }, {});

  const challenges = buildChallenges(state, allArticles);
  const completedChallengeCount = challenges.filter((challenge) => challenge.value >= challenge.target).length;
  const allWorlds = Object.keys(worldCompletion);
  const exploredWorlds = allWorlds.filter((world) => (state.worlds[world]?.visited ?? 0) > 0).length;
  const fogOfWarWorlds = Math.max(0, allWorlds.length - exploredWorlds);

  const skillTreeNodes = [
    {
      id: "systems-thinking",
      label: "Systems Thinking",
      pct: Math.min(100, Math.round((exploredWorlds / Math.max(1, allWorlds.length)) * 100)),
    },
    {
      id: "concept-synthesis",
      label: "Concept Synthesis",
      pct: Math.min(100, Math.round((masteredConcepts / Math.max(1, discoveredConcepts.length || 1)) * 100)),
    },
    {
      id: "investigation-depth",
      label: "Investigation Depth",
      pct: Math.min(100, Math.round((state.completedArticles.length / Math.max(1, allArticles.length)) * 100)),
    },
    {
      id: "pathway-navigation",
      label: "Pathway Navigation",
      pct: Math.min(100, Math.round((Object.keys(pathwayCompletion).length / Math.max(1, uniqueCount(allArticles.flatMap((item) => item.tags.slice(0, 2))))) * 100)),
    },
  ];

  const atlasHidden = Math.max(0, uniqueCount(allArticles.flatMap((item) => item.tags)) - discoveredConcepts.length);
  const canonCompleted = canonQuestSlugs.filter((slug) => state.completedArticles.includes(slug)).length;

  const reflectionQuestions = [
    `Which assumption in ${currentArticle.title} would you challenge after a week?`,
    "What adjacent system might break if this article's thesis is true?",
    "Which concept here deserves a deeper reverse-engineering session?",
  ];

  const relatedConcepts = Array.from(new Set([...currentArticle.tags, ...toc.map((entry) => entry.title)])).slice(0, 6);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/95 px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase shadow-lg backdrop-blur"
      >
        <Compass className="size-3.5" />
        Journey
        <span className="rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[10px] text-primary">
          {level.label}
        </span>
      </button>

      <aside
        className={cn(
          "fixed bottom-18 left-5 z-50 w-[22rem] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-border/70 bg-background/95 p-4 shadow-2xl backdrop-blur transition-all duration-300",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Long-Term Journey
            </p>
            <button
              type="button"
              className="mt-1 inline-flex items-center gap-1.5 font-heading text-lg font-semibold"
              onClick={() => {
                const next = tapCount + 1;
                setTapCount(next);
                if (next >= 7 && !state.unlockedSecrets.includes("easter:tap-seven")) {
                  setState((prev) =>
                    pushEvent(
                      {
                        ...prev,
                        unlockedSecrets: [...prev.unlockedSecrets, "easter:tap-seven"],
                        xp: prev.xp + 42,
                      },
                      { kind: "secret", message: "Easter egg found: Seventh Tap Protocol" },
                    ),
                  );
                }
              }}
            >
              <Crown className="size-4 text-primary" />
              {level.label}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Close journey panel"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Explorer Level {level.index + 1}</span>
            <span>{state.xp} XP</span>
          </div>
          <div className="h-2 rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
          <InfoTile icon={BookOpen} label="Investigations" value={`${state.completedArticles.length}/${allArticles.length}`} />
          <InfoTile icon={Brain} label="Concepts" value={`${discoveredConcepts.length}`} />
          <InfoTile icon={Globe2} label="Worlds" value={`${Object.keys(worldCompletion).length}`} />
          <InfoTile icon={Trophy} label="Achievements" value={`${state.achievements.length}`} />
        </div>

        <div className="mt-4 space-y-3 border-t border-border/60 pt-3">
          <h3 className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Reading Customization Engine
          </h3>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <Picker
              label="Width"
              value={state.prefs.width}
              options={["narrow", "medium", "wide"]}
              onChange={(value) => setState((prev) => ({ ...prev, prefs: { ...prev.prefs, width: value as ReadingPrefs["width"] } }))}
            />
            <Picker
              label="Typography"
              value={state.prefs.typography}
              options={["editorial", "modern", "classic"]}
              onChange={(value) => setState((prev) => ({ ...prev, prefs: { ...prev.prefs, typography: value as ReadingPrefs["typography"] } }))}
            />
            <Picker
              label="Density"
              value={state.prefs.density}
              options={["relaxed", "balanced", "focused"]}
              onChange={(value) => setState((prev) => ({ ...prev, prefs: { ...prev.prefs, density: value as ReadingPrefs["density"] } }))}
            />
            <Picker
              label="Theme"
              value={state.prefs.theme}
              options={["library", "study", "night", "paper"]}
              onChange={(value) => setState((prev) => ({ ...prev, prefs: { ...prev.prefs, theme: value as ReadingPrefs["theme"] } }))}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, prefs: { ...prev.prefs, deepFocus: !prev.prefs.deepFocus } }))}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase",
                state.prefs.deepFocus ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground",
              )}
            >
              <Eye className="size-3" />
              Deep Focus
            </button>
            <Picker
              label="Ambient"
              compact
              value={state.prefs.ambient}
              options={["off", "rain", "fireplace", "ocean", "library"]}
              onChange={(value) => setState((prev) => ({ ...prev, prefs: { ...prev.prefs, ambient: value as ReadingPrefs["ambient"] } }))}
            />
          </div>
        </div>

        <div className="mt-4 space-y-3 border-t border-border/60 pt-3">
          <h3 className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Concept Atlas
          </h3>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <AtlasPill icon={Lock} label="Hidden" value={atlasHidden} />
            <AtlasPill icon={Sparkles} label="Seen" value={discoveredConcepts.length - masteredConcepts} />
            <AtlasPill icon={Gem} label="Mastered" value={masteredConcepts} />
          </div>
          <div className="max-h-28 space-y-1 overflow-auto pr-1">
            {discoveredConcepts.slice(0, 8).map(([concept, entry]) => (
              <div key={concept} className="flex items-center justify-between rounded-md bg-secondary/55 px-2 py-1 text-[10px]">
                <span className="line-clamp-1">{concept}</span>
                <span className="font-mono text-muted-foreground">{entry.state}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2 border-t border-border/60 pt-3">
          <h3 className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Exploration Challenges
          </h3>
          {challenges.map((challenge) => {
            const pct = Math.min(100, Math.round((challenge.value / Math.max(1, challenge.target)) * 100));
            return (
              <div key={challenge.id} className="rounded-md border border-border/60 p-2">
                <div className="flex items-center justify-between text-[11px]">
                  <p className="font-medium">{challenge.label}</p>
                  <p className="font-mono text-muted-foreground">
                    {Math.min(challenge.value, challenge.target)}/{challenge.target}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground">{challenge.description}</p>
                <div className="mt-1.5 h-1.5 rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          <p className="text-[10px] text-muted-foreground">
            {completedChallengeCount} challenge{completedChallengeCount === 1 ? "" : "s"} completed.
          </p>
        </div>
      </aside>

      <section className="mt-10 rounded-2xl border border-border/70 bg-secondary/35 p-6">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Reflective Ending
        </p>
        <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">Where to Explore Next</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold">Related concepts</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {relatedConcepts.map((concept) => (
                <span key={concept} className="rounded-full border border-border px-2 py-1 text-[10px]">
                  {concept}
                </span>
              ))}
            </div>
            <h3 className="mt-4 text-sm font-semibold">Connected investigations</h3>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              {[...recommendedSlugs, ...relatedSlugs].slice(0, 4).map((slug) => (
                <p key={slug}>• /articles/{slug}</p>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Canon quests</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {canonCompleted}/{canonQuestSlugs.length} foundational investigations completed.
            </p>
            <h3 className="mt-4 text-sm font-semibold">Unresolved questions</h3>
            <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {reflectionQuestions.map((question) => (
                <p key={question}>• {question}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border/70 bg-background/60 p-4">
        <div className="flex items-center gap-2">
          <ScrollText className="size-4 text-primary" />
          <h3 className="font-heading text-lg font-semibold">Discovery Journal</h3>
        </div>
        <div className="mt-3 max-h-44 space-y-1 overflow-auto pr-1 text-xs">
          {state.events.slice(0, 12).map((event) => (
            <div key={event.id} className="rounded-md border border-border/50 px-2 py-1.5">
              <p className="font-medium">{event.message}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(event.at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border/70 bg-background/60 p-4">
        <div className="flex items-center gap-2">
          <Map className="size-4 text-primary" />
          <h3 className="font-heading text-lg font-semibold">Personal Knowledge Map</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Fog of war: {fogOfWarWorlds} world{fogOfWarWorlds === 1 ? "" : "s"} still hidden.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <MapBlock icon={Globe2} title="Research Worlds">
            {Object.entries(worldCompletion).map(([world, stats]) => (
              <MetricRow
                key={world}
                label={world}
                value={`${stats.completed}/${stats.total}`}
                pct={Math.round((stats.completed / Math.max(1, stats.total)) * 100)}
              />
            ))}
          </MapBlock>
          <MapBlock icon={Mountain} title="Pathway Progression">
            {Object.entries(pathwayCompletion)
              .slice(0, 6)
              .map(([pathway, stats]) => (
                <MetricRow
                  key={pathway}
                  label={pathway}
                  value={`${stats.completed}/${stats.total}`}
                  pct={Math.round((stats.completed / Math.max(1, stats.total)) * 100)}
                />
              ))}
          </MapBlock>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border/70 bg-background/60 p-4">
        <div className="flex items-center gap-2">
          <Target className="size-4 text-primary" />
          <h3 className="font-heading text-lg font-semibold">Knowledge Skill Trees</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Skill nodes rise as you discover concepts, complete investigations, and unlock pathways.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {skillTreeNodes.map((node) => (
            <div key={node.id} className="rounded-md border border-border/60 bg-secondary/40 px-3 py-2">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium">{node.label}</p>
                <p className="font-mono text-xs text-muted-foreground">{node.pct}%</p>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-background/80">
                <div className="h-full rounded-full bg-primary" style={{ width: `${node.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border/70 bg-background/60 p-4">
        <div className="flex items-center gap-2">
          <Swords className="size-4 text-primary" />
          <h3 className="font-heading text-lg font-semibold">Investigation Achievements</h3>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = state.achievements.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm",
                  unlocked ? "border-primary/45 bg-primary/10" : "border-border/70 bg-secondary/25",
                )}
              >
                <p className="font-medium">{achievement.label}</p>
                <p className="text-xs text-muted-foreground">{unlocked ? "Unlocked" : "Locked"}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border/70 bg-background/60 p-4">
        <div className="flex items-center gap-2">
          <WandSparkles className="size-4 text-primary" />
          <h3 className="font-heading text-lg font-semibold">Easter Eggs & Revisit Rewards</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Secrets unlocked: {state.unlockedSecrets.length}. Revisit older investigations to reveal new relationships and rare concept drops.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {state.unlockedSecrets.slice(0, 8).map((secret) => (
            <span key={secret} className="rounded-full border border-border px-2 py-1 text-[10px] font-mono">
              {secret}
            </span>
          ))}
          {state.unlockedSecrets.length === 0 ? <span className="text-xs text-muted-foreground">No secrets found yet.</span> : null}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border/70 bg-background/60 p-4">
        <div className="flex items-center gap-2">
          <Music2 className="size-4 text-primary" />
          <h3 className="font-heading text-lg font-semibold">Ambient Reading</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Optional zero-cost soundscapes: rain, fireplace, ocean, and library.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(["off", "rain", "fireplace", "ocean", "library"] as const).map((mode) => (
            <button
              type="button"
              key={mode}
              onClick={() => setState((prev) => ({ ...prev, prefs: { ...prev.prefs, ambient: mode } }))}
              className={cn(
                "rounded-md border px-2 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase",
                state.prefs.ambient === mode ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground",
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function unlockAchievements(state: JourneyState): JourneyState {
  let next = state;
  for (const achievement of ACHIEVEMENTS) {
    if (next.achievements.includes(achievement.id)) continue;
    if (!achievement.check(next)) continue;

    next = {
      ...next,
      achievements: [...next.achievements, achievement.id],
      xp: next.xp + 55,
    };
    next = pushEvent(next, {
      kind: "achievement",
      message: `Achievement unlocked: ${achievement.label}`,
    });
  }
  return next;
}

type OverviewProps = {
  allArticles: JourneyArticleMeta[];
};

export function ArticlesJourneyOverview({ allArticles }: OverviewProps) {
  const [state] = useState<JourneyState>(() => readState());

  const worldTotals = allArticles.reduce<Record<string, { total: number; completed: number }>>((acc, article) => {
    const item = acc[article.category] ?? { total: 0, completed: 0 };
    item.total += 1;
    if (state.completedArticles.includes(article.slug)) item.completed += 1;
    acc[article.category] = item;
    return acc;
  }, {});

  const pathwayTotals = allArticles.reduce<Record<string, { total: number; completed: number }>>((acc, article) => {
    for (const tag of article.tags.slice(0, 2)) {
      const item = acc[tag] ?? { total: 0, completed: 0 };
      item.total += 1;
      if (state.completedArticles.includes(article.slug)) item.completed += 1;
      acc[tag] = item;
    }
    return acc;
  }, {});

  const challenges = buildChallenges(state, allArticles);

  return (
    <section className="mb-8 rounded-2xl border border-border/70 bg-background/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Research World Exploration
          </p>
          <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
            Articles Journey Dashboard
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold">
          <Flame className="size-3.5 text-primary" />
          XP {state.xp}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <MapBlock icon={Globe2} title="World Completion">
          {Object.entries(worldTotals).map(([name, stats]) => (
            <MetricRow
              key={name}
              label={name}
              value={`${stats.completed}/${stats.total}`}
              pct={Math.round((stats.completed / Math.max(1, stats.total)) * 100)}
            />
          ))}
        </MapBlock>

        <MapBlock icon={Target} title="Pathway Progress">
          {Object.entries(pathwayTotals)
            .slice(0, 8)
            .map(([name, stats]) => (
              <MetricRow
                key={name}
                label={name}
                value={`${stats.completed}/${stats.total}`}
                pct={Math.round((stats.completed / Math.max(1, stats.total)) * 100)}
              />
            ))}
        </MapBlock>

        <MapBlock icon={Swords} title="Exploration Challenges">
          {challenges.map((challenge) => (
            <MetricRow
              key={challenge.id}
              label={challenge.label}
              value={`${Math.min(challenge.value, challenge.target)}/${challenge.target}`}
              pct={Math.round((challenge.value / Math.max(1, challenge.target)) * 100)}
            />
          ))}
        </MapBlock>
      </div>
    </section>
  );
}

function Picker({
  label,
  value,
  options,
  onChange,
  compact = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <label className={cn("space-y-1", compact ? "min-w-[8.5rem]" : "") }>
      <span className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-7 w-full rounded-md border border-border bg-background px-2 text-[11px]"
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

function InfoTile({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-secondary/45 px-2.5 py-2">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        <Icon className="size-3" />
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function AtlasPill({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="rounded-md border border-border/60 bg-secondary/45 px-2 py-1">
      <p className="flex items-center gap-1 text-[9px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        <Icon className="size-2.5" />
        {label}
      </p>
      <p className="mt-1 text-xs font-semibold">{value}</p>
    </div>
  );
}

function MapBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] uppercase">
        <Icon className="size-3.5 text-primary" />
        {title}
      </h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function MetricRow({ label, value, pct }: { label: string; value: string; pct: number }) {
  const clampedPct = Math.max(0, Math.min(100, pct));
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="line-clamp-1 pr-2">{label}</span>
        <span className="font-mono text-muted-foreground">{value}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-background/75">
        <div className="h-full rounded-full bg-primary" style={{ width: `${clampedPct}%` }} />
      </div>
    </div>
  );
}
