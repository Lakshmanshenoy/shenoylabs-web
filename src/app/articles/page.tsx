import type { Metadata } from "next";

import { ArticlesFilteredGrid } from "@/components/articles/articles-filtered-grid";
import { ChapterOpener } from "@/components/shared/chapter-opener";
import { SectionContainer } from "@/components/shared/section-container";
import { getAllArticles } from "@/lib/content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Articles — Shenoy Labs",
  description:
    "Deeply researched articles on technology, science, finance, and society by Lakshman Shenoy. Written slowly. Published when ready.",
  alternates: {
    canonical: "/articles",
  },
  openGraph: {
    title: "Articles — Shenoy Labs",
    description:
      "Deeply researched articles on technology, science, finance, and society by Lakshman Shenoy. Written slowly. Published when ready.",
    type: "website",
    url: "/articles",
    images: ["/api/og?title=Articles"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles — Shenoy Labs",
    description:
      "Deeply researched articles on technology, science, finance, and society by Lakshman Shenoy. Written slowly. Published when ready.",
    images: ["/api/og?title=Articles"],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

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
