import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, BookOpenIcon } from "lucide-react";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllArticles } from "@/lib/content";
import { cn } from "@/lib/utils";

export function ArticlesPreviewSection() {
  const previewArticles = getAllArticles().slice(0, 3);

  if (!previewArticles.length) return null;

  const lead = previewArticles[0];

  return (
    <SectionContainer className="below-fold bg-secondary/50">
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
        <Link href={`/articles/${lead.slug}`} className="scroll-reveal group block">
          <Card className="soft-lift border border-border/80 bg-card/95 transition-colors group-hover:border-primary/30">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-8">
              {lead.frontmatter.coverImage && (
                <div className="w-full overflow-hidden rounded-xl border border-border/70 sm:w-72">
                  <Image
                    src={lead.frontmatter.coverImage}
                    alt={lead.frontmatter.coverAlt ?? `${lead.frontmatter.title} cover image`}
                    width={1200}
                    height={675}
                    className="h-auto w-full"
                  />
                </div>
              )}
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpenIcon className="size-5" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {lead.frontmatter.primaryCategory}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {lead.readingTime} read ·{" "}
                    {new Date(lead.frontmatter.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
                  {lead.frontmatter.title}
                </h3>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {lead.frontmatter.excerpt}
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
              className="scroll-reveal group block"
            >
              <Card className="soft-lift h-full border border-border/80 bg-card/95 transition-colors group-hover:border-primary/30">
                {article.frontmatter.coverImage && (
                  <div className="overflow-hidden rounded-t-xl border-b border-border/70">
                    <Image
                      src={article.frontmatter.coverImage}
                      alt={
                        article.frontmatter.coverAlt ??
                        `${article.frontmatter.title} cover image`
                      }
                      width={1200}
                      height={675}
                      className="h-auto w-full"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {article.frontmatter.primaryCategory}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {article.readingTime} read ·{" "}
                      {new Date(article.frontmatter.date).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short", day: "numeric" },
                      )}
                    </span>
                  </div>
                  <CardTitle className="text-base font-semibold leading-snug group-hover:text-primary transition-colors">
                    {article.frontmatter.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {article.frontmatter.excerpt}
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
