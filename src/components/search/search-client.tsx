"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type SearchItem = {
  type: "article" | "project";
  title: string;
  excerpt: string;
  href: string;
  category: string;
  tags?: string[];
};

const typeLabel: Record<SearchItem["type"], string> = {
  article: "Article",
  project: "Project",
};

type Props = {
  index: SearchItem[];
  initialCategory?: string;
  initialQuery?: string;
};

export function SearchClient({ index, initialCategory, initialQuery }: Props) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [activeCategory, setActiveCategory] = useState(initialCategory ?? "All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(index.map((item) => item.category))).sort()],
    [index],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return index.filter((item) => {
      const categoryMatch =
        activeCategory === "All" || item.category === activeCategory;
      if (!categoryMatch) return false;

      if (!q) return true;

      const haystack = [
        item.title,
        item.excerpt,
        item.category,
        ...(item.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, index, activeCategory]);

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          type="search"
          placeholder="Search articles and projects…"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          className="h-12 pl-10 text-base"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              activeCategory === category
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Results */}
      {query.trim() === "" && activeCategory === "All" && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Start typing to search across articles and projects.
        </p>
      )}

      {(query.trim() !== "" || activeCategory !== "All") && results.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No results found for &ldquo;{query}&rdquo;.
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-3">
            {results.map((item) => (
              <Link key={item.href} href={item.href} className="group block">
                <Card className="soft-lift border border-border/80 bg-card/95 transition-colors group-hover:border-primary/30">
                  <CardContent className="flex items-start gap-4 p-4">
                    <Badge
                      variant="outline"
                      className="mt-0.5 shrink-0 text-xs"
                    >
                      {typeLabel[item.type]}
                    </Badge>
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium leading-snug transition-colors group-hover:text-primary">
                        {item.title}
                      </p>
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {item.excerpt}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
