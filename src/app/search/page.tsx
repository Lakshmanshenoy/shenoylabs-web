import type { Metadata } from "next";

import { SearchClient } from "@/components/search/search-client";
import type { SearchItem } from "@/components/search/search-client";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { getAllArticles, getAllProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Search — Shenoy Labs",
  description: "Search across all articles and projects on Shenoy Labs.",
  alternates: { canonical: "/search" },
  openGraph: {
    title: "Search — Shenoy Labs",
    description: "Search across all articles and projects on Shenoy Labs.",
    type: "website",
    url: "/search",
    images: ["/og-default.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Search — Shenoy Labs",
    description: "Search across all articles and projects on Shenoy Labs.",
    images: ["/og-default.svg"],
  },
  robots: { index: false },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const articles = getAllArticles();
  const projects = getAllProjects();

  const index: SearchItem[] = [
    ...articles.map((a) => ({
      type: "article" as const,
      title: a.frontmatter.title,
      excerpt: a.frontmatter.excerpt,
      href: `/articles/${a.slug}`,
      category: a.frontmatter.primaryCategory,
      tags: a.frontmatter.tags,
    })),
    ...projects.map((p) => ({
      type: "project" as const,
      title: p.frontmatter.title,
      excerpt: p.frontmatter.description,
      href: `/projects/${p.slug}`,
      category: p.frontmatter.primaryCategory,
      tags: p.frontmatter.tags,
    })),
  ];

  return (
    <SectionContainer className="max-w-3xl">
      <SectionHeader
        badge="Search"
        title="Search Shenoy Labs"
        description="Find articles and projects across the site."
      />
      <div className="mt-8">
        <SearchClient
          index={index}
          initialCategory={params.category}
          initialQuery={params.q}
        />
      </div>
    </SectionContainer>
  );
}
