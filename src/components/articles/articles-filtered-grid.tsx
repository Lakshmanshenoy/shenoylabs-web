"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock3Icon,
  LayoutGridIcon,
  ListIcon,
  SearchIcon,
} from "lucide-react";

import type { ArticleFrontmatter, ContentItem } from "@/lib/content";
import { cn } from "@/lib/utils";

type Props = {
  articles: ContentItem<ArticleFrontmatter>[];
};

export function ArticlesFilteredGrid({ articles }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const categories = useMemo(
    () =>
      [
        "All",
        ...Array.from(
          new Set(
            articles
              .map((a) => a.frontmatter.primaryCategory ?? a.frontmatter.category)
              .filter(Boolean),
          ),
        ).sort(),
      ],
    [articles],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return articles.filter((article) => {
      const category = article.frontmatter.primaryCategory ?? article.frontmatter.category;
      const matchesCategory = activeCategory === "All" || category === activeCategory;
      if (!matchesCategory) return false;
      if (!query) return true;

      const haystack = [
        article.frontmatter.title,
        article.frontmatter.excerpt,
        category,
        ...(article.frontmatter.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [articles, activeCategory, search]);

  const featured = useMemo(
    () =>
      filtered.find((item) => item.frontmatter.featured) ??
      (activeCategory === "All" && !search.trim() ? filtered[0] : null),
    [filtered, activeCategory, search],
  );

  const pool = useMemo(
    () => filtered.filter((item) => item.slug !== featured?.slug),
    [filtered, featured],
  );

  const anchor = pool[0];
  const mids = pool.slice(1, 3);
  const small = pool.slice(3, 7);

  const seriesGroups = useMemo(() => {
    const map = new Map<string, ContentItem<ArticleFrontmatter>[]>();
    for (const article of articles) {
      const keys = (article.frontmatter.tags ?? []).slice(0, 2);
      for (const key of keys) {
        const list = map.get(key) ?? [];
        list.push(article);
        map.set(key, list);
      }
    }
    return Array.from(map.entries())
      .filter(([, items]) => items.length > 1)
      .slice(0, 2);
  }, [articles]);

  const totalReadingMinutes = articles.reduce((sum, article) => {
    const match = article.readingTime.match(/\d+/);
    return sum + (match ? Number.parseInt(match[0], 10) : 0);
  }, 0);

  const liveDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const showHero = !!featured && activeCategory === "All" && !search.trim();

  return (
    <div className="space-y-10">
      <section className="border-b-2 border-foreground pb-5">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              {liveDate}
            </p>
            <h1 className="mt-3 text-5xl font-bold leading-[0.9] tracking-tight sm:text-7xl">
              Long-form
              <br />
              <span className="text-primary italic">Research</span>
            </h1>
          </div>
          <div className="max-w-sm text-right">
            <p className="text-sm italic text-muted-foreground">
              Deeply researched articles on technology, science, finance, and
              society. Written slowly. Published when ready.
            </p>
            <div className="mt-4 flex justify-end gap-5">
              <div className="text-right">
                <p className="text-3xl font-bold leading-none text-primary">{articles.length}</p>
                <p className="text-[10px] tracking-[0.1em] text-muted-foreground uppercase">Articles</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold leading-none text-primary">{seriesGroups.length}</p>
                <p className="text-[10px] tracking-[0.1em] text-muted-foreground uppercase">Series</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold leading-none text-primary">{totalReadingMinutes}</p>
                <p className="text-[10px] tracking-[0.1em] text-muted-foreground uppercase">Min read</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search articles..."
            className="h-10 w-full rounded-sm border border-input bg-background pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>

        <div className="flex flex-1 flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase transition-colors",
                activeCategory === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-sm border transition-colors",
              view === "grid"
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:bg-secondary",
            )}
            aria-label="Grid view"
          >
            <LayoutGridIcon className="size-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-sm border transition-colors",
              view === "list"
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:bg-secondary",
            )}
            aria-label="List view"
          >
            <ListIcon className="size-4" />
          </button>
        </div>
      </section>

      {showHero ? (
        <section className="border-b border-border pb-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
            <div className="overflow-hidden rounded-md border border-border bg-secondary/60">
              {featured.frontmatter.coverImage ? (
                <Image
                  src={featured.frontmatter.coverImage}
                  alt={featured.frontmatter.coverAlt ?? `${featured.frontmatter.title} cover image`}
                  width={1200}
                  height={675}
                  className="h-auto w-full"
                />
              ) : (
                <div className="flex aspect-[3/2] items-center justify-center text-7xl font-bold text-foreground/15">
                  ∑
                </div>
              )}
            </div>

            <div>
              <p className="mb-3 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                <span className="mr-2 inline-block size-1.5 rounded-full bg-primary" />
                Featured Investigation
              </p>
              <Link
                href={`/articles/${featured.slug}`}
                className="text-3xl font-bold leading-tight tracking-tight transition-colors hover:text-primary"
              >
                {featured.frontmatter.title}
              </Link>
              <p className="mt-3 text-base italic text-muted-foreground">
                {featured.frontmatter.excerpt}
              </p>
              <p className="mt-4 flex flex-wrap items-center gap-2 text-[11px] tracking-[0.07em] text-muted-foreground uppercase">
                <span className="font-semibold text-primary">
                  {featured.frontmatter.primaryCategory ?? featured.frontmatter.category}
                </span>
                <span>·</span>
                <span>{featured.frontmatter.date}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock3Icon className="size-3" />
                  {featured.readingTime}
                </span>
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {view === "grid" ? (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="inline-block h-0.5 w-8 bg-primary" />
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Recent Investigations
            </p>
          </div>

          {anchor ? (
            <div className="grid overflow-hidden rounded-lg border border-border lg:grid-cols-3">
              <Link
                href={`/articles/${anchor.slug}`}
                className="border-b border-border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary hover:shadow-md lg:col-span-1 lg:row-span-2 lg:border-b-0 lg:border-r"
              >
                <p className="text-[10px] font-semibold tracking-[0.12em] text-primary uppercase">
                  {anchor.frontmatter.primaryCategory ?? anchor.frontmatter.category}
                </p>
                <p className="mt-2 text-2xl font-bold leading-tight transition-colors hover:text-primary">
                  {anchor.frontmatter.title}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{anchor.frontmatter.excerpt}</p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {anchor.frontmatter.date} · {anchor.readingTime}
                </p>
              </Link>

              <div className="lg:col-span-2">
                {[...mids, ...small].slice(0, 6).map((article, index) => (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}`}
                    className={cn(
                      "block border-b border-border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary hover:shadow-sm",
                      index === [...mids, ...small].slice(0, 6).length - 1 && "border-b-0",
                    )}
                  >
                    <p className="text-[10px] font-semibold tracking-[0.12em] text-primary uppercase">
                      {article.frontmatter.primaryCategory ?? article.frontmatter.category}
                    </p>
                    <p className="mt-1 text-lg font-semibold leading-tight">
                      {article.frontmatter.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {article.frontmatter.date} · {article.readingTime}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border px-6 py-16 text-center text-muted-foreground">
              No articles match your search.
            </div>
          )}
        </section>
      ) : (
        <section className="overflow-hidden rounded-lg border border-border">
          {filtered.length > 0 ? (
            filtered.map((article, index) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="flex items-center gap-4 border-b border-border px-5 py-4 transition-all duration-200 last:border-b-0 hover:-translate-y-0.5 hover:bg-secondary hover:shadow-sm"
              >
                <p className="w-12 text-3xl font-bold leading-none text-foreground/20">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold tracking-[0.12em] text-primary uppercase">
                    {article.frontmatter.primaryCategory ?? article.frontmatter.category}
                  </p>
                  <p className="mt-1 text-lg font-semibold leading-tight transition-colors hover:text-primary">
                    {article.frontmatter.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {article.frontmatter.date} · {article.readingTime}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="px-6 py-16 text-center text-muted-foreground">
              No articles match your search.
            </p>
          )}
        </section>
      )}

      {seriesGroups.length > 0 && activeCategory === "All" && !search.trim() ? (
        <section className="border-t-2 border-foreground pt-10">
          <div className="flex items-center gap-3">
            <span className="inline-block h-0.5 w-8 bg-primary" />
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Article Series
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {seriesGroups.map(([pathway, items]) => (
              <div key={pathway} className="rounded-lg border border-border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Pathway
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">{pathway}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Curated sequence through connected investigations.
                </p>
                <div className="mt-4 space-y-2">
                  {items.slice(0, 3).map((item, index) => (
                    <Link
                      key={item.slug}
                      href={`/articles/${item.slug}`}
                      className="flex items-center gap-3 rounded-sm bg-secondary px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <span className="w-5 text-center font-semibold text-muted-foreground">
                        {index + 1}
                      </span>
                      <span className="line-clamp-1">{item.frontmatter.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
