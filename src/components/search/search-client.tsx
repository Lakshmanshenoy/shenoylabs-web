"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type SearchItem = {
  type: "article" | "project" | "tool";
  title: string;
  excerpt: string;
  href: string;
  category?: string;
  tags?: string[];
};

const typeLabel: Record<SearchItem["type"], string> = {
  article: "Article",
  project: "Project",
  tool: "Tool",
};

type Props = {
  index: SearchItem[];
};

export function SearchClient({ index }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index.filter((item) => {
      const haystack = [
        item.title,
        item.excerpt,
        item.category ?? "",
        ...(item.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, index]);

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          type="search"
          placeholder="Search articles, projects, tools…"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          className="h-12 pl-10 text-base"
        />
      </div>

      {/* Results */}
      {query.trim() === "" && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Start typing to search across all articles, projects, and tools.
        </p>
      )}

      {query.trim() !== "" && results.length === 0 && (
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
