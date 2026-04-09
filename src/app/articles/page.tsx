import type { Metadata } from "next";

import { InteractionCtaPanel } from "@/components/engagement/interaction-cta-panel";
import { NewsletterPlaceholder } from "@/components/engagement/newsletter-placeholder";
import { ArticlesFilteredGrid } from "@/components/articles/articles-filtered-grid";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
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
    images: ["/og-default.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles — Shenoy Labs",
    description:
      "In-depth articles on product, engineering, and founder strategy by Lakshman Shenoy.",
    images: ["/og-default.svg"],
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

      <SectionHeader
        badge="Articles"
        title="Research & writing"
        description="In-depth explorations of product thinking, engineering patterns, and founder strategy."
      />

      <div className="mt-10">
        <ArticlesFilteredGrid articles={articles} />
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 md:items-stretch">
        <NewsletterPlaceholder />
        <InteractionCtaPanel />
      </div>
    </SectionContainer>
  );
}
