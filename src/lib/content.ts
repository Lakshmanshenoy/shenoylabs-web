import fs from "fs";
import path from "path";

import matter from "gray-matter";
import readingTime from "reading-time";

import type { DepthLevel, PrimaryCategory } from "@/lib/taxonomy";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type ArticleFrontmatter = {
  title: string;
  excerpt: string;
  summary?: string;
  slug?: string;
  date: string;
  published_at?: string;
  createdDate?: string;
  lastUpdated?: string;
  category: string;
  primaryCategory: PrimaryCategory;
  tags: string[];
  research_worlds: string[];
  concepts: string[];
  pathways: string[];
  related_investigations: string[];
  related_projects: string[];
  featured?: boolean;
  featuredOrder?: number;
  depth_mode?: string;
  reading_pacing?: string;
  investigation_type?: string;
  reading_time?: string;
  author: string;
  depthLevel?: DepthLevel;
  coverImage?: string;
  problem?: string;
  whyItMatters?: string;
  coverAlt?: string;
};

export type ProjectFrontmatter = {
  title: string;
  description: string;
  date: string;
  primaryCategory: PrimaryCategory;
  tags: string[];
  depthLevel?: DepthLevel;
  status: "shipped" | "in-progress" | "planning";
  featured?: boolean;
  featuredOrder?: number;
  problem?: string;
  whyItMatters?: string;
  githubUrl?: string;
  liveUrl?: string;
  coverImage?: string;
  coverAlt?: string;
};

export type ContentItem<T> = {
  slug: string;
  frontmatter: T;
  readingTime: string;
  source: string;
};

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function parseItem<T>(type: "projects", filename: string): ContentItem<T> {
  const slug = filename.replace(/\.mdx$/, "");
  const filePath = path.join(CONTENT_DIR, type, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const rt = readingTime(content);

  return {
    slug,
    frontmatter: data as T,
    readingTime: rt.text,
    source: raw,
  };
}

function normalizeArticleFrontmatter(
  raw: Record<string, unknown>,
  slug: string,
  computedReadingTime: string,
): ArticleFrontmatter {
  const summary =
    (typeof raw.summary === "string" && raw.summary) ||
    (typeof raw.excerpt === "string" && raw.excerpt) ||
    (typeof raw.description === "string" && raw.description) ||
    "Investigation in progress.";

  const publishedAt =
    (typeof raw.published_at === "string" && raw.published_at) ||
    (typeof raw.createdDate === "string" && raw.createdDate) ||
    (typeof raw.date === "string" && raw.date) ||
    new Date().toISOString().slice(0, 10);

  const worlds = toArray(raw.research_worlds);
  const concepts = toArray(raw.concepts);
  const pathways = toArray(raw.pathways);
  const tags = unique([...toArray(raw.tags), ...concepts]);

  return {
    title: typeof raw.title === "string" ? raw.title : slug,
    excerpt: summary,
    summary,
    slug,
    date: publishedAt,
    published_at: publishedAt,
    createdDate:
      (typeof raw.createdDate === "string" && raw.createdDate) || publishedAt,
    lastUpdated:
      (typeof raw.lastUpdated === "string" && raw.lastUpdated) ||
      (typeof raw.last_updated === "string" ? raw.last_updated : undefined) ||
      publishedAt,
    category:
      (typeof raw.category === "string" && raw.category) || "Investigations",
    primaryCategory: ((typeof raw.primaryCategory === "string" && raw.primaryCategory) ||
      worlds[0] ||
      "Investigations") as PrimaryCategory,
    tags,
    research_worlds: worlds,
    concepts,
    pathways,
    related_investigations: toArray(raw.related_investigations),
    related_projects: toArray(raw.related_projects),
    featured: typeof raw.featured === "boolean" ? raw.featured : undefined,
    featuredOrder:
      typeof raw.featuredOrder === "number" ? raw.featuredOrder : undefined,
    depth_mode: typeof raw.depth_mode === "string" ? raw.depth_mode : undefined,
    reading_pacing:
      typeof raw.reading_pacing === "string" ? raw.reading_pacing : undefined,
    investigation_type:
      typeof raw.investigation_type === "string"
        ? raw.investigation_type
        : undefined,
    reading_time:
      (typeof raw.reading_time === "string" && raw.reading_time) ||
      computedReadingTime,
    author: typeof raw.author === "string" ? raw.author : "Shenoy Labs",
    depthLevel:
      typeof raw.depthLevel === "string"
        ? (raw.depthLevel as DepthLevel)
        : undefined,
    coverImage: typeof raw.coverImage === "string" ? raw.coverImage : undefined,
    problem: typeof raw.problem === "string" ? raw.problem : undefined,
    whyItMatters:
      typeof raw.whyItMatters === "string" ? raw.whyItMatters : undefined,
    coverAlt: typeof raw.coverAlt === "string" ? raw.coverAlt : undefined,
  };
}

function getInvestigationDir(): string {
  const preferred = path.join(CONTENT_DIR, "investigations");
  if (fs.existsSync(preferred)) {
    return preferred;
  }
  return path.join(CONTENT_DIR, "articles");
}

export function getAllArticles(): ContentItem<ArticleFrontmatter>[] {
  const dir = getInvestigationDir();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const filePath = path.join(dir, filename);
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);
      const rt = readingTime(content).text;

      return {
        slug,
        frontmatter: normalizeArticleFrontmatter(
          data as Record<string, unknown>,
          slug,
          rt,
        ),
        readingTime: rt,
        source: raw,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.frontmatter.published_at ?? b.frontmatter.date).getTime() -
        new Date(a.frontmatter.published_at ?? a.frontmatter.date).getTime(),
    );
}

export function getArticle(slug: string): ContentItem<ArticleFrontmatter> {
  const investigationPath = path.join(CONTENT_DIR, "investigations", `${slug}.mdx`);
  const articlePath = path.join(CONTENT_DIR, "articles", `${slug}.mdx`);
  const filePath = fs.existsSync(investigationPath) ? investigationPath : articlePath;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const rt = readingTime(content).text;

  return {
    slug,
    frontmatter: normalizeArticleFrontmatter(data as Record<string, unknown>, slug, rt),
    readingTime: rt,
    source: raw,
  };
}

export function getAllProjects(): ContentItem<ProjectFrontmatter>[] {
  const dir = path.join(CONTENT_DIR, "projects");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  return files
    .map((f) => parseItem<ProjectFrontmatter>("projects", f))
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime(),
    );
}

export function getProject(slug: string): ContentItem<ProjectFrontmatter> {
  return parseItem<ProjectFrontmatter>("projects", `${slug}.mdx`);
}

export type PageFrontmatter = Record<string, string>;

export function getPageContent(slug: string): ContentItem<PageFrontmatter> {
  const filePath = path.join(CONTENT_DIR, "pages", `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    frontmatter: data as PageFrontmatter,
    readingTime: "",
    source: content,
  };
}
