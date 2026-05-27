import type { Metadata } from "next";

import { InteractionCtaPanel } from "@/components/engagement/interaction-cta-panel";
import { ArticlesFilteredGrid } from "@/components/articles/articles-filtered-grid";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { getAllArticles } from "@/lib/content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Articles — Shenoy Labs",
  description:
    "Investigation-led writing across systems, infrastructure, engineering, and long-form inquiry.",
  alternates: {
    canonical: "/articles",
  },
  openGraph: {
    title: "Articles — Shenoy Labs",
    description:
      "Investigation-led writing across systems, infrastructure, engineering, and long-form inquiry.",
    type: "website",
    url: "/articles",
    images: ["/api/og?title=Articles"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles — Shenoy Labs",
    description:
      "Investigation-led writing across systems, infrastructure, engineering, and long-form inquiry.",
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

      <SectionHeader
        badge="Investigations"
        title="Inquiry-driven long-form"
        description="Structured investigations designed for deep reading, conceptual continuity, and practical technical insight."
      />

      <div className="mt-10">
        <ArticlesFilteredGrid articles={articles} />
      </div>

      <div className="mx-auto mt-12 max-w-2xl">
        <InteractionCtaPanel />
      </div>
    </SectionContainer>
  );
}
