"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ArticleFrontmatter, ContentItem } from "@/lib/content";

type Props = {
  articles: ContentItem<ArticleFrontmatter>[];
};

export function ArticlesFilteredGrid({ articles }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(
    new Set(articles.map((a) => a.frontmatter.category)),
  ).sort();

  const filtered =
    activeCategory === null
      ? articles
      : articles.filter((a) => a.frontmatter.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory(null)}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setActiveCategory(activeCategory === cat ? null : cat)
            }
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Articles grid */}
      <div className="reveal-group grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="group block"
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

      {filtered.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No articles in this category yet.
        </p>
      )}
    </div>
  );
}
