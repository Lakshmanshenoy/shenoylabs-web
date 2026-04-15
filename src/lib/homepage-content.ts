import fs from "fs";
import path from "path";

import type { ProjectFrontmatter } from "@/lib/content";
import { getAllProjects } from "@/lib/content";

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
  visualImage?: string;
  visualAlt?: string;
};

export type FeaturedProject = {
  slug: string;
  title: string;
  problem: string;
  whyItMatters: string;
  tags: string[];
  thumbnail?: string;
  thumbnailAlt?: string;
  status: string;
  statusColor: string;
};

export type FeaturedProjectsContent = {
  projects: FeaturedProject[];
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
  // Derive featured projects from the `content/projects` MDX files.
  // Prefer explicit frontmatter `featured: true`. Fallback to the most
  // recently shipped projects.
  const all = getAllProjects();

  const statusMap: Record<string, { label: string; color: string }> = {
    shipped: { label: "Shipped", color: "bg-emerald-400" },
    "in-progress": { label: "In Progress", color: "bg-amber-400" },
    planning: { label: "Planning", color: "bg-sky-400" },
  };

  let featured = all.filter((p) => (p.frontmatter as ProjectFrontmatter).featured === true);

  if (featured.length === 0) {
    featured = all
      .filter((p) => p.frontmatter.status === "shipped")
      .slice(0, 3);
  }

  if (featured.length === 0) {
    featured = all.slice(0, 3);
  }

  // Sort by explicit featuredOrder (if present), otherwise by date (newest first)
  featured.sort((a, b) => {
    const fa = a.frontmatter as ProjectFrontmatter;
    const fb = b.frontmatter as ProjectFrontmatter;
    const oa = typeof fa.featuredOrder !== 'undefined' ? Number(fa.featuredOrder) : undefined;
    const ob = typeof fb.featuredOrder !== 'undefined' ? Number(fb.featuredOrder) : undefined;
    if (oa !== undefined && ob !== undefined) return oa - ob;
    if (oa !== undefined) return -1;
    if (ob !== undefined) return 1;
    return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
  });

  const projects = featured.slice(0, 3).map((p) => {
    const fm = p.frontmatter as ProjectFrontmatter;
    const statusCfg = statusMap[fm.status] ?? { label: fm.status ?? "", color: "bg-sky-400" };

    return {
      slug: p.slug,
      title: fm.title,
      problem: fm.problem ?? fm.description ?? "",
      whyItMatters: fm.whyItMatters ?? fm.description ?? "",
      tags: fm.tags ?? [],
      thumbnail: fm.coverImage,
      thumbnailAlt: fm.coverAlt,
      status: statusCfg.label,
      statusColor: statusCfg.color,
    } as FeaturedProject;
  });

  return { projects };
}

export function getSupportCopyContent(): SupportCopyContent {
  return readJson<SupportCopyContent>("support-copy.json");
}
