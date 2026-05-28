import type { Metadata } from "next";

import { ProjectsFilteredGrid } from "@/components/projects/projects-filtered-grid";
import { SectionContainer } from "@/components/shared/section-container";
import { getAllProjects } from "@/lib/content";
import { getGitHubProjectsData, type GitHubProjectsData } from "@/lib/github-projects";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projects — Shenoy Labs",
  description:
    "Shipped products, ongoing builds, and planned work by Lakshman Shenoy.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Projects — Shenoy Labs",
    description:
      "Shipped products, ongoing builds, and planned work by Lakshman Shenoy.",
    type: "website",
    url: "/projects",
    images: ["/api/og?title=Projects"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects — Shenoy Labs",
    description:
      "Shipped products, ongoing builds, and planned work by Lakshman Shenoy.",
    images: ["/api/og?title=Projects"],
  },
};

export default async function ProjectsPage() {
  const projects = getAllProjects();
  let githubData: GitHubProjectsData | null = null;

  try {
    githubData = await getGitHubProjectsData();
  } catch {
    githubData = null;
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
  ]);

  return (
    <SectionContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <ProjectsFilteredGrid
        projects={projects}
        githubRepos={githubData?.repos ?? []}
        githubStats={githubData?.stats ?? null}
      />
    </SectionContainer>
  );
}
