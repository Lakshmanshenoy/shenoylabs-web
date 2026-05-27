import fs from "fs";
import path from "path";

import matter from "gray-matter";

const root = process.cwd();
const investigationsDir = path.join(root, "content", "investigations");

if (!fs.existsSync(investigationsDir)) {
  console.log("No content/investigations directory found. Skipping stewardship validation.");
  process.exit(0);
}

const files = fs
  .readdirSync(investigationsDir)
  .filter((file) => file.endsWith(".mdx"));

const failures = [];

for (const file of files) {
  const filePath = path.join(investigationsDir, file);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data } = matter(raw);

  const title = data.title;
  const summary = data.summary ?? data.excerpt;
  const concepts = Array.isArray(data.concepts) ? data.concepts : [];
  const pathways = Array.isArray(data.pathways) ? data.pathways : [];
  const worlds = Array.isArray(data.research_worlds) ? data.research_worlds : [];
  const callbacks = Array.isArray(data.temporal_callbacks)
    ? data.temporal_callbacks
    : [];
  const relatedInvestigations = Array.isArray(data.related_investigations)
    ? data.related_investigations
    : [];
  const relatedProjects = Array.isArray(data.related_projects)
    ? data.related_projects
    : [];

  if (typeof title !== "string" || title.trim().length < 6) {
    failures.push(`${file}: missing or weak title`);
  }

  if (typeof summary !== "string" || summary.trim().length < 24) {
    failures.push(`${file}: missing or weak summary/excerpt`);
  }

  if (concepts.length < 1) {
    failures.push(`${file}: at least one concept is required`);
  }

  if (pathways.length < 1) {
    failures.push(`${file}: at least one pathway is required`);
  }

  if (worlds.length < 1) {
    failures.push(`${file}: at least one research world is required`);
  }

  if (!Array.isArray(data.temporal_callbacks)) {
    failures.push(`${file}: temporal_callbacks must be present as an array`);
  }

  if (concepts.length > 8) {
    failures.push(`${file}: concept list is too dense (max 8)`);
  }

  if (relatedInvestigations.length > 4) {
    failures.push(`${file}: related_investigations is too dense (max 4)`);
  }

  if (relatedProjects.length > 4) {
    failures.push(`${file}: related_projects is too dense (max 4)`);
  }

  if (callbacks.length > 4) {
    failures.push(`${file}: temporal_callbacks is too dense (max 4)`);
  }
}

if (failures.length > 0) {
  console.error("Stewardship validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`Stewardship validation passed for ${files.length} investigations.`);
