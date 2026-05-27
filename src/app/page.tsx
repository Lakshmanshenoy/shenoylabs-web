import type { Metadata } from "next";
import Link from "next/link";

import { getAllArticles, getAllProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Home — Shenoy Labs",
  description: "Research, tools, and projects built in public by Lakshman Shenoy.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const allArticles = getAllArticles();
  const allProjects = getAllProjects();

  const featuredArticle =
    allArticles.find((article) => article.frontmatter.featured) ?? allArticles[0];
  const recentArticles = allArticles
    .filter((article) => article.slug !== featuredArticle?.slug)
    .slice(0, 4);
  const mostRead = allArticles.slice(0, 4);
  const topicCounts = allArticles.reduce<Record<string, number>>((acc, article) => {
    const category = article.frontmatter.category;
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});
  const topics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const recentProjects = allProjects.slice(0, 2);

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-14 text-center sm:px-6 lg:px-8">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {todayLabel}
          </p>
          <h1 className="mt-4 text-6xl leading-[0.93] sm:text-7xl md:text-8xl lg:text-9xl">
            Shenoy<span className="text-primary">.</span>Labs
          </h1>
          <p className="mt-3 text-sm tracking-[0.18em] text-muted-foreground uppercase">
            Think · Learn · Solve
          </p>
          <div className="mt-8 flex flex-wrap justify-center border-y border-border">
            <Link href="/articles" className="border-r border-border px-5 py-3 text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:bg-secondary hover:text-primary">
              Articles
            </Link>
            <Link href="/projects" className="border-r border-border px-5 py-3 text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:bg-secondary hover:text-primary">
              Projects
            </Link>
            <Link href="/support" className="px-5 py-3 text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:bg-secondary hover:text-primary">
              Support Us
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl border-b border-border px-4 sm:px-6 lg:grid-cols-[2fr_1fr] lg:px-8">
        <div className="border-border py-10 lg:border-r lg:pr-10">
          <p className="mb-5 inline-block bg-primary px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-primary-foreground uppercase">
            Featured Article
          </p>
          {featuredArticle ? (
            <>
              <Link
                href={`/articles/${featuredArticle.slug}`}
                className="font-heading block text-3xl leading-tight tracking-tight transition-colors hover:text-primary sm:text-4xl"
              >
                {featuredArticle.frontmatter.title}
              </Link>
              <p className="mt-4 max-w-2xl text-base text-muted-foreground">
                {featuredArticle.frontmatter.excerpt}
              </p>
              <p className="mt-4 text-[11px] tracking-[0.07em] text-muted-foreground uppercase">
                <span className="font-semibold text-primary">{featuredArticle.frontmatter.category}</span>
                <span className="mx-2">·</span>
                <span>{featuredArticle.frontmatter.author}</span>
                <span className="mx-2">·</span>
                <span>{featuredArticle.frontmatter.date}</span>
                <span className="mx-2">·</span>
                <span>{featuredArticle.readingTime}</span>
              </p>
            </>
          ) : null}

          <div className="mt-10 border-t border-border pt-8">
            <p className="mb-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Recent Articles
            </p>
            <div className="space-y-5">
              {recentArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="block border-b border-border pb-5 transition-colors last:border-none hover:text-primary"
                >
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
                    {article.frontmatter.category}
                  </p>
                  <p className="mt-1 font-heading text-2xl leading-tight">{article.frontmatter.title}</p>
                  <p className="mt-1 text-xs tracking-[0.07em] text-muted-foreground uppercase">
                    {article.frontmatter.date} · {article.readingTime}
                  </p>
                </Link>
              ))}
            </div>
            <Link
              href="/articles"
              className="mt-4 inline-flex rounded-sm border border-border px-4 py-2 text-xs font-semibold tracking-[0.07em] uppercase transition-colors hover:bg-secondary"
            >
              View All Articles
            </Link>
          </div>
        </div>

        <aside className="py-10 lg:pl-9">
          <p className="mb-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
            Most Read
          </p>
          <div className="space-y-4">
            {mostRead.map((article, index) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="block border-b border-border pb-4 transition-colors last:border-none hover:text-primary"
              >
                <p className="font-heading text-4xl leading-none text-foreground/20">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 font-heading text-base leading-snug">{article.frontmatter.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{article.frontmatter.category}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <p className="mb-4 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Topics
            </p>
            <div className="space-y-1">
              {topics.map(([topic, count]) => (
                <Link
                  key={topic}
                  href={`/articles?category=${encodeURIComponent(topic)}`}
                  className="flex items-center justify-between border-b border-border py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <span>{topic}</span>
                  <span className="text-xs">{count} articles</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="border-y border-border bg-secondary/60 py-14">
        <div className="mx-auto w-full max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl">Research in your inbox.</h2>
          <p className="mt-3 text-base text-muted-foreground">
            Deeply researched essays on technology, science, finance, and society.
          </p>
          <div className="mx-auto mt-5 flex max-w-xl flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder="your@email.com"
              className="h-11 flex-1 rounded-sm border border-input bg-background px-4 text-sm outline-none ring-0 transition-colors focus:border-primary"
            />
            <Link
              href="/support"
              className="inline-flex h-11 items-center justify-center rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Subscribe
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
            Recent Projects
          </p>
          <Link href="/projects" className="text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground transition-colors hover:text-primary">
            View All
          </Link>
        </div>
        <div className="grid gap-px rounded-md border border-border bg-border md:grid-cols-2">
          {recentProjects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group bg-background p-7 transition-colors hover:bg-secondary"
            >
              <p className="font-heading text-2xl leading-tight">{project.frontmatter.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{project.frontmatter.description}</p>
              <p className="mt-4 text-xs tracking-[0.08em] text-muted-foreground uppercase">
                {project.frontmatter.status} · {project.frontmatter.primaryCategory}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
