import fs from "fs";
import path from "path";

const HOMEPAGE_DIR = path.join(process.cwd(), "content", "homepage");

function readJson<T>(filename: string): T {
  const raw = fs.readFileSync(path.join(HOMEPAGE_DIR, filename), "utf-8");
  return JSON.parse(raw) as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type HeroContent = {
  headline: string;
  identityLine: string;
  subheadline: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  statusLine: string;
  tagline: string;
  whatIDo: { icon: string; label: string }[];
  credentialFootnote: string;
};

export type FeaturedProject = {
  slug: string;
  title: string;
  problem: string;
  whyItMatters: string;
  tags: string[];
  status: string;
  statusColor: string;
};

export type FeaturedProjectsContent = {
  projects: FeaturedProject[];
};

export type ChangelogEntry = {
  date: string;
  title: string;
  description: string;
  status: "shipped" | "in-progress" | "planned";
};

export type CurrentlyExploringContent = {
  dynamicLine: string;
  pillars: string[];
  explorationCards: string[];
  nextItems: ChangelogEntry[];
};

export type SupportCopyContent = {
  heading: string;
  body: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  footnote: string;
};

// ─── Readers ──────────────────────────────────────────────────────────────────

export function getHeroContent(): HeroContent {
  return readJson<HeroContent>("hero.json");
}

export function getFeaturedProjectsContent(): FeaturedProjectsContent {
  return readJson<FeaturedProjectsContent>("featured-projects.json");
}

export function getCurrentlyExploringContent(): CurrentlyExploringContent {
  return readJson<CurrentlyExploringContent>("currently-exploring.json");
}

export function getSupportCopyContent(): SupportCopyContent {
  return readJson<SupportCopyContent>("support-copy.json");
}
