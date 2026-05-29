import { siteConfig } from "@/lib/site";

export type GitHubRepoSummary = {
  name: string;
  fullName: string;
  description: string;
  writeup?: string;
  type?: "Tool" | "Library" | "Research" | "Experiment";
  status?: "Active" | "Archived";
  featured?: boolean;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  archived: boolean;
  updatedAt: string;
  pushedAt: string;
  topics: string[];
};

export type GitHubProjectStats = {
  repoCount: number;
  stars: number;
  forks: number;
  languageCount: number;
  lastActive: string | null;
};

export type GitHubProjectsData = {
  repos: GitHubRepoSummary[];
  stats: GitHubProjectStats;
  source: "github" | "fallback";
};

type GitHubApiRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  archived: boolean;
  pushed_at: string;
  updated_at: string;
  topics?: string[];
  fork: boolean;
};

const HIDDEN_REPOS = new Set(["lstest", "bharat-alpha", "equilis-india"]);
const STALE_THRESHOLD_MONTHS = 18;

type RepoOverride = {
  description?: string;
  writeup?: string;
  featured?: boolean;
  type?: "Tool" | "Library" | "Research" | "Experiment";
  status?: "Active" | "Archived";
};

const REPO_OVERRIDES: Record<string, RepoOverride> = {
  "shenoylabs-web": {
    description:
      "The ShenoyLabs website: a research and engineering journal built with Next.js, TypeScript, and TinaCMS. Open source.",
    writeup:
      "The public-facing Shenoy Labs website, designed for deep reading and transparent building. It combines an editorial-first UI with a robust content pipeline so long-form articles and project logs can be published quickly without sacrificing performance or maintainability.",
    featured: true,
    type: "Research",
    status: "Active",
  },
  caffilab: {
    description:
      "A scientific caffeine half-life estimator. Enter your drinks and see real-time caffeine clearance curves.",
    writeup:
      "A scientific caffeine estimator that models caffeine clearance over time using half-life dynamics. You can log drinks throughout the day and immediately visualize your estimated caffeine load, making it useful for sleep timing and avoiding late-day crashes.",
    featured: true,
    type: "Tool",
    status: "Active",
  },
  "battmon-macos": {
    description:
      "A lightweight macOS menu bar app for battery level alerts, built with Python and rumps.",
    writeup:
      "A lightweight macOS utility that watches battery levels and raises clear, unobtrusive alerts at chosen thresholds. It was built to solve a practical daily workflow problem while staying minimal and resource-friendly.",
    featured: true,
    type: "Tool",
    status: "Active",
  },
};

function isStale(updatedAt: string): boolean {
  const updated = new Date(updatedAt);
  if (Number.isNaN(updated.getTime())) return true;
  const monthsAgo = (Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24 * 30);
  return monthsAgo > STALE_THRESHOLD_MONTHS;
}

function usernameFromConfig(): string {
  const fromEnv = process.env.GITHUB_PROJECTS_USERNAME ?? process.env.NEXT_PUBLIC_GITHUB_USERNAME;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv.trim();

  const explicit = process.env.GITHUB_REPOSITORY?.split("/")[0];
  if (explicit) return explicit;

  return "Lakshmanshenoy";
}

export async function getGitHubProjectsData(): Promise<GitHubProjectsData> {
  const username = usernameFromConfig();
  const token = process.env.GITHUB_TOKEN ?? process.env.TINA_GITHUB_TOKEN;

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": `${siteConfig.name} Projects Page`,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed&type=owner`,
    {
      headers,
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status}`);
  }

  const payload = (await response.json()) as GitHubApiRepo[];
  const repos = payload
    .filter((repo) => !repo.fork)
    .filter((repo) => {
      if (HIDDEN_REPOS.has(repo.name)) return false;
      if (isStale(repo.updated_at)) return false;
      const override = REPO_OVERRIDES[repo.name];
      const description = override?.description ?? repo.description ?? "";
      if (!description.trim()) return false;
      return true;
    })
    .map<GitHubRepoSummary>((repo) => ({
      ...(REPO_OVERRIDES[repo.name] ?? {}),
      name: repo.name,
      fullName: repo.full_name,
      description:
        REPO_OVERRIDES[repo.name]?.description ?? repo.description ?? "No description provided.",
      htmlUrl: repo.html_url,
      homepage: repo.homepage,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      archived: repo.archived,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
      topics: repo.topics ?? [],
    }))
    .sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime());

  const stats: GitHubProjectStats = {
    repoCount: repos.length,
    stars: repos.reduce((sum, repo) => sum + repo.stars, 0),
    forks: repos.reduce((sum, repo) => sum + repo.forks, 0),
    languageCount: new Set(repos.map((repo) => repo.language).filter(Boolean)).size,
    lastActive: repos[0]?.pushedAt ?? null,
  };

  return {
    repos,
    stats,
    source: "github",
  };
}
