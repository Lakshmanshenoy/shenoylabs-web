"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDaysIcon,
  CircleDotIcon,
  ExternalLinkIcon,
  SearchIcon,
  WrenchIcon,
} from "lucide-react";

import { GitHubBrandIcon } from "@/components/shared/social-brand-icons";
import type { ContentItem, ProjectFrontmatter } from "@/lib/content";
import type { GitHubProjectStats, GitHubRepoSummary } from "@/lib/github-projects";
import { cn } from "@/lib/utils";

type Props = {
  projects: ContentItem<ProjectFrontmatter>[];
  githubRepos: GitHubRepoSummary[];
  githubStats: GitHubProjectStats | null;
};

type ProjectStatus = ProjectFrontmatter["status"];

const statusMeta: Record<
  ProjectStatus,
  { label: string; className: string; dotClassName: string }
> = {
  shipped: {
    label: "Active",
    className: "bg-emerald-100 text-emerald-700",
    dotClassName: "bg-emerald-500",
  },
  "in-progress": {
    label: "Maintained",
    className: "bg-sky-100 text-sky-700",
    dotClassName: "bg-sky-500",
  },
  planning: {
    label: "Experimental",
    className: "bg-amber-100 text-amber-700",
    dotClassName: "bg-amber-500",
  },
};

const knownLanguages = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Rust",
  "Go",
  "Shell",
  "Java",
  "C",
  "C++",
  "C#",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Dart",
] as const;

function inferLanguage(project: ContentItem<ProjectFrontmatter>): string {
  const tags = project.frontmatter.tags ?? [];
  const found = tags.find((tag) =>
    knownLanguages.some((lang) => lang.toLowerCase() === tag.toLowerCase()),
  );
  return found ?? tags[0] ?? "Other";
}

function inferType(project: ContentItem<ProjectFrontmatter>): "Tool" | "Library" | "Research" | "Experiment" {
  const tags = (project.frontmatter.tags ?? []).map((tag) => tag.toLowerCase());
  if (tags.some((tag) => ["sdk", "package", "library", "framework"].includes(tag))) {
    return "Library";
  }
  if (tags.some((tag) => ["research", "analysis", "paper", "benchmark"].includes(tag))) {
    return "Research";
  }
  if (tags.some((tag) => ["prototype", "poc", "experimental", "lab"].includes(tag))) {
    return "Experiment";
  }
  return "Tool";
}

export function ProjectsFilteredGrid({ projects, githubRepos, githubStats }: Props) {
  const [query, setQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<"All" | ProjectStatus>("All");
  const [activeType, setActiveType] = useState<"All" | "Tool" | "Library" | "Research" | "Experiment">("All");
  const [activeLanguage, setActiveLanguage] = useState<string>("All");

  const enriched = useMemo(
    () =>
      projects.map((project) => ({
        ...project,
        inferredLanguage: inferLanguage(project),
        inferredType: inferType(project),
      })),
    [projects],
  );

  const languageOptions = useMemo(
    () => [
      "All",
      ...Array.from(new Set(enriched.map((project) => project.inferredLanguage))).sort(),
    ],
    [enriched],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return enriched.filter((project) => {
      const matchesStatus = activeStatus === "All" || project.frontmatter.status === activeStatus;
      const matchesType = activeType === "All" || project.inferredType === activeType;
      const matchesLanguage = activeLanguage === "All" || project.inferredLanguage === activeLanguage;

      if (!matchesStatus || !matchesType || !matchesLanguage) return false;
      if (!needle) return true;

      const haystack = [
        project.frontmatter.title,
        project.frontmatter.description,
        project.inferredType,
        project.inferredLanguage,
        ...(project.frontmatter.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [enriched, activeStatus, activeType, activeLanguage, query]);

  const featured = (() => {
    const items = filtered.filter((project) => project.frontmatter.featured);
    if (items.length > 0) {
      return [...items].sort(
        (a, b) =>
          (a.frontmatter.featuredOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.frontmatter.featuredOrder ?? Number.MAX_SAFE_INTEGER),
      );
    }
    return filtered.slice(0, 2);
  })();

  const latest = useMemo(
    () =>
      [...projects]
        .map((project) => new Date(project.frontmatter.date))
        .sort((a, b) => b.getTime() - a.getTime())[0],
    [projects],
  );

  const liveDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalRepos = projects.length;
  const totalStars = githubStats?.stars ?? projects.reduce(
    (sum, project) => sum + (project.frontmatter.tags?.length ?? 0),
    0,
  );
  const totalForks = githubStats?.forks ?? 0;
  const activeCount = projects.filter((project) => project.frontmatter.status === "shipped").length;
  const languageCount = githubStats?.languageCount ?? new Set(enriched.map((project) => project.inferredLanguage)).size;
  const autoRepos = useMemo(() => {
    const localUrls = new Set(
      projects
        .map((project) => project.frontmatter.githubUrl?.toLowerCase())
        .filter(Boolean) as string[],
    );
    return githubRepos.filter((repo) => !localUrls.has(repo.htmlUrl.toLowerCase()));
  }, [projects, githubRepos]);

  const filteredAutoRepos = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return autoRepos.filter((repo) => {
      const matchesLanguage =
        activeLanguage === "All" || (repo.language ?? "Other") === activeLanguage;
      if (!matchesLanguage) return false;

      if (activeStatus !== "All") {
        if (activeStatus === "planning" && !repo.archived) return false;
        if (activeStatus !== "planning" && repo.archived) return false;
      }

      if (activeType !== "All" && activeType !== "Tool") return false;

      if (!needle) return true;
      const haystack = [repo.name, repo.description, repo.language ?? "Other", ...repo.topics]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [autoRepos, query, activeLanguage, activeStatus, activeType]);

  return (
    <div className="space-y-10">
      <section className="border-b-2 border-foreground pb-5">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              {liveDate}
            </p>
            <h1 className="mt-3 text-5xl font-bold leading-[0.9] tracking-tight sm:text-7xl">
              Open Source
              <br />
              <span className="text-primary italic">Projects</span>
            </h1>
          </div>
          <div className="max-w-sm text-left lg:text-right">
            <p className="text-sm italic text-muted-foreground">
              Built to learn, shared to help. Open projects, libraries, and experiments
              with clear write-ups and practical takeaways.
            </p>
            <a
              href="https://github.com/Lakshmanshenoy"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <GitHubBrandIcon className="size-3.5" /> @Lakshmanshenoy
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-r border-border/80 pr-4 last:border-r-0">
            <p className="text-4xl font-bold leading-none text-foreground">{githubStats?.repoCount ?? totalRepos}</p>
            <p className="mt-1 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Repositories
            </p>
          </div>
          <div className="border-r border-border/80 pr-4 last:border-r-0">
            <p className="text-4xl font-bold leading-none text-foreground">{totalStars}</p>
            <p className="mt-1 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Total Stars
            </p>
          </div>
          <div className="border-r border-border/80 pr-4 last:border-r-0">
            <p className="text-4xl font-bold leading-none text-foreground">{githubStats ? totalForks : activeCount}</p>
            <p className="mt-1 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              {githubStats ? "Total Forks" : "Active Builds"}
            </p>
          </div>
          <div>
            <p className="text-4xl font-bold leading-none text-foreground">{languageCount}</p>
            <p className="mt-1 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Languages
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Last active {(githubStats?.lastActive ? new Date(githubStats.lastActive) : latest)?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects..."
              className="h-10 w-full rounded-sm border border-input bg-background pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>

          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
            <button
              onClick={() => {
                setQuery("");
                setActiveStatus("All");
                setActiveType("All");
                setActiveLanguage("All");
              }}
              className="rounded-sm px-2 py-1 transition-colors hover:text-primary"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="min-w-16 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Language
          </span>
          {languageOptions.map((language) => (
            <button
              key={language}
              onClick={() => setActiveLanguage(language)}
              className={cn(
                "rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase transition-colors",
                activeLanguage === language
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {language}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="min-w-16 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Type
          </span>
          {(["All", "Tool", "Library", "Research", "Experiment"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                "rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase transition-colors",
                activeType === type
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="min-w-16 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Status
          </span>
          {(["All", "shipped", "in-progress", "planning"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={cn(
                "rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase transition-colors",
                activeStatus === status
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {status === "All" ? "All" : statusMeta[status].label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="inline-block h-0.5 w-8 bg-primary" />
          <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Featured Projects
          </p>
        </div>

        <div className="grid gap-3">
          {featured.length > 0 ? (
            featured.map((project, index) => {
              const meta = statusMeta[project.frontmatter.status] ?? statusMeta.planning;
              return (
                <article
                  key={project.slug}
                  className={cn(
                    "grid overflow-hidden rounded-lg border border-border bg-card/95 transition-shadow hover:shadow-md",
                    index % 2 === 0 ? "lg:grid-cols-[360px_1fr]" : "lg:grid-cols-[1fr_360px]",
                  )}
                >
                  <Link
                    href={`/projects/${project.slug}`}
                    className={cn(
                      "relative flex min-h-56 items-center justify-center border-border bg-secondary/55 p-6",
                      index % 2 === 0 ? "border-r" : "order-2 border-l",
                    )}
                  >
                    {project.frontmatter.coverImage ? (
                      <Image
                        src={project.frontmatter.coverImage}
                        alt={project.frontmatter.coverAlt ?? `${project.frontmatter.title} cover image`}
                        width={1200}
                        height={675}
                        className="h-auto w-full"
                      />
                    ) : (
                      <span className="text-7xl text-foreground/20">∑</span>
                    )}
                  </Link>

                  <div className="flex flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                          {project.inferredType}
                        </p>
                        <Link
                          href={`/projects/${project.slug}`}
                          className="mt-1 block text-2xl font-bold leading-tight tracking-tight transition-colors hover:text-primary"
                        >
                          {project.frontmatter.title}
                        </Link>
                      </div>
                      <span className={cn("rounded-full px-2 py-1 text-[10px] font-semibold uppercase", meta.className)}>
                        {meta.label}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {project.frontmatter.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {(project.frontmatter.tags ?? []).slice(0, 6).map((tag) => (
                        <span key={tag} className="rounded-sm border border-border px-2 py-1 text-[10px] text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <CircleDotIcon className={cn("size-3", meta.dotClassName)} />
                          {project.inferredLanguage}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDaysIcon className="size-3" />
                          {new Date(project.frontmatter.date).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {project.frontmatter.githubUrl ? (
                          <a
                            href={project.frontmatter.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-sm border border-border p-1.5 transition-colors hover:border-primary hover:text-primary"
                            aria-label="Open GitHub"
                          >
                            <GitHubBrandIcon className="size-3.5" />
                          </a>
                        ) : null}
                        {project.frontmatter.liveUrl ? (
                          <a
                            href={project.frontmatter.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-sm border border-border p-1.5 transition-colors hover:border-primary hover:text-primary"
                            aria-label="Open live project"
                          >
                            <ExternalLinkIcon className="size-3.5" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <p className="rounded-lg border border-border px-6 py-10 text-center text-sm text-muted-foreground">
              No featured projects for the current filter.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-4 border-t border-border pt-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              <span className="mr-2 inline-block h-0.5 w-6 bg-primary align-middle" />
              All Projects
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Compact index of all repositories</p>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project) => {
              const meta = statusMeta[project.frontmatter.status] ?? statusMeta.planning;
              return (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="group rounded-lg border border-border bg-card/90 p-4 transition-colors hover:border-primary/35 hover:bg-secondary/30"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                      <span className={cn("inline-block size-2 rounded-full", meta.dotClassName)} />
                      {meta.label}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{project.inferredLanguage}</span>
                  </div>

                  <p className="line-clamp-2 text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
                    {project.frontmatter.title}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {project.frontmatter.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {(project.frontmatter.tags ?? []).slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-border px-8 py-14 text-center">
            <WrenchIcon className="mx-auto size-6 text-muted-foreground/60" />
            <p className="mt-3 text-sm text-muted-foreground">No projects match this filter combination.</p>
          </div>
        )}
      </section>

      {filteredAutoRepos.length > 0 ? (
        <section className="space-y-4 border-t border-border pt-10">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              <span className="mr-2 inline-block h-0.5 w-6 bg-primary align-middle" />
              Auto-synced GitHub Repositories
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fetched via GitHub API and refreshed every hour.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAutoRepos.slice(0, 24).map((repo) => (
              <article
                key={repo.fullName}
                className="rounded-lg border border-border bg-card/90 p-4 transition-colors hover:border-primary/35 hover:bg-secondary/30"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    <span className={cn("inline-block size-2 rounded-full", repo.archived ? "bg-slate-500" : "bg-emerald-500")} />
                    {repo.archived ? "Archived" : "Active"}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{repo.language ?? "Other"}</span>
                </div>

                <a
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="line-clamp-2 text-lg font-semibold leading-tight transition-colors hover:text-primary"
                >
                  {repo.name}
                </a>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {repo.description}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>★ {repo.stars} · Forks {repo.forks}</span>
                  <span>{new Date(repo.pushedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
