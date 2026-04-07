import type { Metadata } from "next";

import { SearchClient } from "@/components/search/search-client";
import type { SearchItem } from "@/components/search/search-client";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { getAllArticles, getAllProjects } from "@/lib/content";
import { toolsRegistry } from "@/lib/tools-registry";

export const metadata: Metadata = {
  title: "Search — Shenoy Labs",
  description: "Search across all articles, projects, and tools on Shenoy Labs.",
  alternates: { canonical: "/search" },
  robots: { index: false },
};

export default function SearchPage() {
  const articles = getAllArticles();
  const projects = getAllProjects();

  const index: SearchItem[] = [
    ...articles.map((a) => ({
      type: "article" as const,
      title: a.frontmatter.title,
      excerpt: a.frontmatter.excerpt,
      href: `/articles/${a.slug}`,
      category: a.frontmatter.category,
      tags: a.frontmatter.tags,
    })),
    ...projects.map((p) => ({
      type: "project" as const,
      title: p.frontmatter.title,
      excerpt: p.frontmatter.description,
      href: `/projects/${p.slug}`,
      tags: p.frontmatter.tags,
    })),
    ...toolsRegistry.map((t) => ({
      type: "tool" as const,
      title: t.title,
      excerpt: t.description,
      href: `/tools/${t.slug}`,
      category: t.category,
    })),
  ];

  return (
    <SectionContainer className="max-w-3xl">
      <SectionHeader
        badge="Search"
        title="Search Shenoy Labs"
        description="Find articles, projects, and tools across the site."
      />
      <div className="mt-8">
        <SearchClient index={index} />
      </div>
    </SectionContainer>
  );
}
