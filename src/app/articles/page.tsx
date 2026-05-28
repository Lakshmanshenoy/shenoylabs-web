import type { Metadata } from "next";

import { ArticlesFilteredGrid } from "@/components/articles/articles-filtered-grid";
import { SectionContainer } from "@/components/shared/section-container";
import { getAllArticles } from "@/lib/content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Articles — Shenoy Labs",
  description:
    "In-depth articles on product, engineering, and founder strategy by Lakshman Shenoy.",
  alternates: {
    canonical: "/articles",
  },
  openGraph: {
    title: "Articles — Shenoy Labs",
    description:
      "In-depth articles on product, engineering, and founder strategy by Lakshman Shenoy.",
    type: "website",
    url: "/articles",
    images: ["/api/og?title=Articles"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles — Shenoy Labs",
    description:
      "In-depth articles on product, engineering, and founder strategy by Lakshman Shenoy.",
    images: ["/api/og?title=Articles"],
  },
};

export default function ArticlesPage() {
  const articles = getAllArticles();
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Articles", path: "/articles" },
  ]);

  return (
    <SectionContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <ArticlesFilteredGrid articles={articles} />
    </SectionContainer>
  );
}
