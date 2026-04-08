import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon } from "lucide-react";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const previewArticles = [
  {
    slug: "building-in-public",
    title: "Why building in public is the best career move you haven't made",
    excerpt:
      "Transparency about your work creates compounding credibility faster than any marketing strategy.",
    category: "Founder",
    readingTime: "6 min",
    date: "Mar 28, 2026",
  },
  {
    slug: "nextjs-performance-patterns",
    title: "Next.js performance patterns that actually move the needle",
    excerpt:
      "A deep-dive into the RSC + streaming model, partial pre-rendering, and edge execution trade-offs.",
    category: "Engineering",
    readingTime: "12 min",
    date: "Mar 14, 2026",
  },
  {
    slug: "product-research-on-a-budget",
    title: "Lean product research without a UX team",
    excerpt:
      "The minimal toolkit I use to validate ideas before writing a single line of code.",
    category: "Product",
    readingTime: "8 min",
    date: "Feb 22, 2026",
  },
];

export function ArticlesPreviewSection() {
  return (
    <SectionContainer className="bg-secondary/50">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            badge="Articles"
            title="Research Notes & Articles"
            description="In-depth explorations across product, engineering, systems thinking, and research."
          />
          <Link
            href="/articles"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "shrink-0 gap-1.5",
            )}
          >
            View all articles
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>

        {/* Featured article — wide card — reveal on scroll */}
        <Link href={`/articles/${previewArticles[0].slug}`} className="group block">
          <Card className="soft-lift border border-border/80 bg-card/95 transition-colors group-hover:border-primary/30">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-8">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpenIcon className="size-5" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {previewArticles[0].category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {previewArticles[0].readingTime} read ·{" "}
                    {previewArticles[0].date}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
                  {previewArticles[0].title}
                </h3>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {previewArticles[0].excerpt}
                </p>
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Read Article
                  <ArrowRightIcon className="size-3.5" />
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Smaller article cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {previewArticles.slice(1).map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group block"
            >
              <Card className="soft-lift h-full border border-border/80 bg-card/95 transition-colors group-hover:border-primary/30">
                <CardHeader>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {article.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {article.readingTime} read · {article.date}
                    </span>
                  </div>
                  <CardTitle className="text-base font-semibold leading-snug group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {article.excerpt}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    Read Article
                    <ArrowRightIcon className="size-3.5" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
