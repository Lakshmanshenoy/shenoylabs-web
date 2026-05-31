import type { Metadata } from "next";

import { ArticlesFilteredGrid } from "@/components/articles/articles-filtered-grid";
import { ChapterOpener } from "@/components/shared/chapter-opener";
import { SectionContainer } from "@/components/shared/section-container";
import { getAllArticles } from "@/lib/content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Articles — ShenoyLabs",
  description:
    "Deeply researched writing on technology, science, finance, and society by Lakshman Shenoy.",
  alternates: {
    canonical: "/articles",
  },
  openGraph: {
    title: "Articles — ShenoyLabs",
    description:
      "Deeply researched writing on technology, science, finance, and society.",
    type: "website",
    url: "/articles",
    siteName: "ShenoyLabs",
    images: [
      {
        url: "/api/og?title=Articles&type=page&description=Deeply+researched+writing+on+technology%2C+science%2C+and+systems",
        width: 1200,
        height: 630,
        alt: "Articles — ShenoyLabs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles — ShenoyLabs",
    description:
      "Deeply researched writing on technology, science, finance, and society.",
    images: ["/api/og?title=Articles&type=page"],
    creator: "@shenoylakshman",
  },
};

export default function ArticlesPage() {
  const articles = getAllArticles();
  const topTopics = Array.from(
    new Set(
      articles
        .map((article) => article.frontmatter.primaryCategory ?? article.frontmatter.category)
        .filter(Boolean),
    ),
  )
    .slice(0, 3)
    .map((topic) => ({
      href: `/articles?category=${encodeURIComponent(topic)}`,
      label: topic,
    }));

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Articles", path: "/articles" },
  ]);

  return (
    <SectionContainer className="env-article rounded-2xl">
      <JsonLd id="jsonld-articles-page" json={breadcrumbJsonLd} />

      <ChapterOpener
        kicker="Investigations"
        title="Research written with depth, not urgency"
        deck="Long-form reporting and explainers across technology, science, finance, and society. Each piece is built to stay useful months after publishing."
        links={topTopics}
        className="mb-10 border-b border-border/60 pb-8"
        headingLevel="h2"
      />

      <ArticlesFilteredGrid articles={articles} />
    </SectionContainer>
  );
}
