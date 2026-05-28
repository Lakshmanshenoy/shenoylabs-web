import { siteConfig } from "@/lib/site";

export type GitHubRepoSummary = {
  name: string;
  fullName: string;
  description: string;
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
    .map<GitHubRepoSummary>((repo) => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description ?? "No description provided.",
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
