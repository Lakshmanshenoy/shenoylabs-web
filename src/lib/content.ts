import fs from "fs";
import path from "path";

import matter from "gray-matter";
import readingTime from "reading-time";

const CONTENT_DIR = path.join(process.cwd(), "content");

// ─── Types ───────────────────────────────────────────────────────────────────

export type ArticleFrontmatter = {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  tags: string[];
  author: string;
};

export type ProjectFrontmatter = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  status: "shipped" | "in-progress" | "planning";
  githubUrl?: string;
  liveUrl?: string;
};

export type ContentItem<T> = {
  slug: string;
  frontmatter: T;
  readingTime: string;
  /** Raw MDX source — passed to compileMDX on the detail page */
  source: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseItem<T>(type: "articles" | "projects", filename: string): ContentItem<T> {
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

// ─── Public API ──────────────────────────────────────────────────────────────

export function getAllArticles(): ContentItem<ArticleFrontmatter>[] {
  const dir = path.join(CONTENT_DIR, "articles");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  return files
    .map((f) => parseItem<ArticleFrontmatter>("articles", f))
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime(),
    );
}

export function getArticle(slug: string): ContentItem<ArticleFrontmatter> {
  return parseItem<ArticleFrontmatter>("articles", `${slug}.mdx`);
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

// ─── Static pages ─────────────────────────────────────────────────────────────

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
