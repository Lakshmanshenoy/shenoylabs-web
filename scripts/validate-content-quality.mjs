#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");

const ARTICLE_REQUIRED = [
  "title",
  "excerpt",
  "date",
  "category",
  "primaryCategory",
  "tags",
  "author",
];

const PROJECT_REQUIRED = [
  "title",
  "description",
  "date",
  "primaryCategory",
  "tags",
  "status",
];

const STATUS_VALUES = new Set(["shipped", "in-progress", "planning"]);

function listMdxFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => path.join(dir, name));
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function parseContentBody(raw) {
  const parsed = matter(raw);
  return {
    frontmatter: parsed.data ?? {},
    body: parsed.content ?? "",
  };
}

function extractHeadings(body) {
  const lines = body.split("\n");
  const headings = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    const match = /^(#{1,6})\s+(.+)$/.exec(line);
    if (!match) continue;
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
      line: i + 1,
    });
  }
  return headings;
}

function validateHeadingOrder(filePath, body, errors) {
  const headings = extractHeadings(body);
  let prev = 0;
  for (const h of headings) {
    if (prev !== 0 && h.level > prev + 1) {
      errors.push(
        `${toPosix(path.relative(ROOT, filePath))}:${h.line} heading level jumps from h${prev} to h${h.level}`,
      );
    }
    prev = h.level;
  }
}

function validateImages(filePath, body, errors) {
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    // Markdown images: ![alt](src)
    const mdMatches = [...line.matchAll(/!\[(.*?)\]\((.*?)\)/g)];
    for (const match of mdMatches) {
      const alt = (match[1] ?? "").trim();
      if (!alt) {
        errors.push(
          `${toPosix(path.relative(ROOT, filePath))}:${i + 1} image is missing alt text`,
        );
      }
    }

    // JSX Image/img tags in MDX
    const jsxImageMatch = /<(Image|img)\b[^>]*>/g;
    for (const match of line.matchAll(jsxImageMatch)) {
      const tag = match[0];
      const altMatch = /\balt\s*=\s*"([^"]*)"/.exec(tag);
      if (!altMatch || !altMatch[1].trim()) {
        errors.push(
          `${toPosix(path.relative(ROOT, filePath))}:${i + 1} JSX image tag is missing alt text`,
        );
      }
    }
  }
}

function validateRequiredFrontmatter(filePath, frontmatter, required, errors) {
  for (const field of required) {
    const value = frontmatter[field];
    const missing =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0);

    if (missing) {
      errors.push(
        `${toPosix(path.relative(ROOT, filePath))}: frontmatter '${field}' is required`,
      );
    }
  }
}

function validateCommonFrontmatter(filePath, frontmatter, errors) {
  const title = String(frontmatter.title ?? "").trim();
  if (title && title.length > 95) {
    errors.push(
      `${toPosix(path.relative(ROOT, filePath))}: title is too long (${title.length} chars; keep <= 95)`,
    );
  }

  if (frontmatter.coverImage && !String(frontmatter.coverAlt ?? "").trim()) {
    errors.push(
      `${toPosix(path.relative(ROOT, filePath))}: coverImage is set but coverAlt is missing`,
    );
  }
}

function validateArticle(filePath, frontmatter, body, errors) {
  validateRequiredFrontmatter(filePath, frontmatter, ARTICLE_REQUIRED, errors);
  validateCommonFrontmatter(filePath, frontmatter, errors);

  if (!Array.isArray(frontmatter.tags)) {
    errors.push(`${toPosix(path.relative(ROOT, filePath))}: frontmatter 'tags' must be an array`);
  }

  const excerpt = String(frontmatter.excerpt ?? "").trim();
  if (excerpt && excerpt.length < 40) {
    errors.push(
      `${toPosix(path.relative(ROOT, filePath))}: excerpt is too short (${excerpt.length} chars; keep >= 40)`,
    );
  }

  validateHeadingOrder(filePath, body, errors);
  validateImages(filePath, body, errors);
}

function validateProject(filePath, frontmatter, body, errors) {
  validateRequiredFrontmatter(filePath, frontmatter, PROJECT_REQUIRED, errors);
  validateCommonFrontmatter(filePath, frontmatter, errors);

  if (!STATUS_VALUES.has(String(frontmatter.status ?? ""))) {
    errors.push(
      `${toPosix(path.relative(ROOT, filePath))}: status must be one of shipped|in-progress|planning`,
    );
  }

  validateHeadingOrder(filePath, body, errors);
  validateImages(filePath, body, errors);
}

function main() {
  const articleFiles = listMdxFiles(path.join(CONTENT_DIR, "articles"));
  const projectFiles = listMdxFiles(path.join(CONTENT_DIR, "projects"));

  const errors = [];

  for (const filePath of articleFiles) {
    const raw = fs.readFileSync(filePath, "utf8");
    const { frontmatter, body } = parseContentBody(raw);
    validateArticle(filePath, frontmatter, body, errors);
  }

  for (const filePath of projectFiles) {
    const raw = fs.readFileSync(filePath, "utf8");
    const { frontmatter, body } = parseContentBody(raw);
    validateProject(filePath, frontmatter, body, errors);
  }

  if (errors.length > 0) {
    console.error("Content quality validation failed:\n");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `Content quality: OK (${articleFiles.length} articles, ${projectFiles.length} projects validated)`,
  );
}

main();
