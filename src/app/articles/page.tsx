import type { Metadata } from "next";
import Link from "next/link";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllArticles } from "@/lib/content";

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

  return (
    <SectionContainer>
      <SectionHeader
        badge="Articles"
        title="Research & writing"
        description="In-depth explorations of product thinking, engineering patterns, and founder strategy."
      />

      <div className="reveal-group mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="group block"
          >
            <Card className="soft-lift h-full border border-border/80 bg-card/95 transition-colors group-hover:border-primary/30">
              <CardHeader>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {article.frontmatter.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {article.readingTime}
                  </span>
                </div>
                <CardTitle className="text-base font-semibold leading-snug transition-colors group-hover:text-primary">
                  {article.frontmatter.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {article.frontmatter.excerpt}
                </p>
                <p className="mt-3 text-xs text-muted-foreground/70">
                  {new Date(article.frontmatter.date).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" },
                  )}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
