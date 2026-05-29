import type { Metadata } from "next";
import Link from "next/link";

import { SupportCardCta } from "@/components/shared/support-card-cta";
import { getAllArticles, getAllProjects } from "@/lib/content";
import { getGitHubProjectsData } from "@/lib/github-projects";
import { getSupportCopyContent } from "@/lib/homepage-content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Home — Shenoy Labs",
  description: "Research and projects built in public by Lakshman Shenoy.",
  alternates: {
    canonical: "/",
  },
};

type RecentProjectCard = {
  title: string;
  description: string;
  href: string;
  status: string;
  primaryCategory: string;
};

export default async function Home() {
  const allArticles = getAllArticles();
  const allProjects = getAllProjects();
  const supportCopy = getSupportCopyContent();
  let githubProjectCards: RecentProjectCard[] = [];

  try {
    const githubData = await getGitHubProjectsData();
    githubProjectCards = githubData.repos.slice(0, 2).map((repo) => ({
      title: repo.name,
      description: repo.description,
      href: repo.htmlUrl,
      status: repo.archived ? "Archived" : repo.pushedAt ? "Active" : "Updated",
      primaryCategory: repo.language ?? "GitHub",
    }));
  } catch {
    githubProjectCards = [];
  }

  const featuredArticle =
    allArticles.find((article) => article.frontmatter.featured) ?? allArticles[0];
  const recentArticles = allArticles
    .filter((article) => article.slug !== featuredArticle?.slug)
    .slice(0, 4);
  const mostRead = allArticles.slice(0, 4);
  const topicCounts = allArticles.reduce<Record<string, number>>((acc, article) => {
    const category = article.frontmatter.category ?? "Uncategorised";
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});
  const topics = Object.entries(topicCounts)
    .filter(([topic]) => {
      const trimmed = topic.trim();
      const normalized = trimmed.toLowerCase();
      return normalized !== "" && normalized !== "undefined" && normalized !== "null";
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const recentProjects: RecentProjectCard[] =
    allProjects.length >= 2
      ? allProjects.slice(0, 2).map((project) => ({
          title: project.frontmatter.title,
          description: project.frontmatter.description,
          href: `/projects/${project.slug}`,
          status: project.frontmatter.status,
          primaryCategory: project.frontmatter.primaryCategory,
        }))
      : githubProjectCards.length >= 2
        ? githubProjectCards
        : [
            {
              title: "Shenoy Labs Website",
              description: "The research and publishing site itself, built as a public-facing platform.",
              href: "/projects",
              status: "Active",
              primaryCategory: "Platform",
            },
            {
              title: "Open Research Notes",
              description: "A living collection of long-form articles, experiments, and systems thinking.",
              href: "/articles",
              status: "Active",
              primaryCategory: "Research",
            },
          ];

  const todayLabel =
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    }) + " IST";

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
          <p className="mt-6 text-sm tracking-[0.18em] text-muted-foreground uppercase sm:mt-7 lg:mt-8">
            Think · <span className="text-primary">Learn</span> · Solve
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

      <section className="border-b border-border py-14 md:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
            Available to collaborate · India
          </p>
          <h2 className="font-[family-name:var(--font-body)] mb-4 max-w-2xl text-4xl font-semibold italic leading-tight text-foreground md:text-5xl">
            Research &amp; projects<br />built in public.
          </h2>
          <p className="mb-8 max-w-xl text-base leading-relaxed text-muted-foreground">
            Deeply researched writing on technology, science, and systems — by{" "}
            <Link href="/about" className="text-foreground underline underline-offset-2 decoration-primary/50 hover:decoration-primary transition-colors">
              Lakshman Shenoy
            </Link>
            . No ads. No algorithms. Published when ready.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/articles"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              Read Articles →
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              View Projects
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl border-b border-border px-4 sm:px-6 lg:grid-cols-[2fr_1fr] lg:px-8">
        <div className="border-b border-border py-3 text-center text-[13px] text-muted-foreground tracking-[0.02em] lg:col-span-2">
          Deeply researched articles on technology, science, finance and society written by
          <span className="ml-1 font-semibold text-foreground">Lakshman Shenoy</span>.
        </div>
        <div className="border-border py-10 lg:border-r lg:pr-10">
          <p className="mb-5 inline-block bg-primary px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-primary-foreground uppercase">
            Featured Article
          </p>
          {featuredArticle ? (
            <>
              <Link
                href={`/articles/${featuredArticle.slug}`}
                className="font-[family-name:var(--font-body)] block text-3xl font-semibold italic leading-tight tracking-tight transition-colors hover:text-primary sm:text-4xl"
              >
                {featuredArticle.frontmatter.title}
              </Link>
              <p className="mt-4 max-w-2xl text-base text-muted-foreground">
                {featuredArticle.frontmatter.excerpt}
              </p>
              <p className="mt-4 text-[11px] tracking-[0.07em] text-muted-foreground uppercase">
                <span className="font-semibold text-primary">{featuredArticle.frontmatter.category ?? "Uncategorised"}</span>
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
                    {article.frontmatter.category ?? "Uncategorised"}
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
              View All Articles →
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
                <p className="mt-1 text-xs text-muted-foreground">
                  {(article.frontmatter.category ?? "Uncategorised")} · {article.readingTime}
                </p>
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

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
            Recent Projects
          </p>
          <Link href="/projects" className="text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground transition-colors hover:text-primary">
            View All →
          </Link>
        </div>
        <div className="grid gap-px rounded-md border border-border bg-border md:grid-cols-2">
          {recentProjects.map((project) => (
            <Link
              key={`${project.title}-${project.href}`}
              href={project.href}
              className="group bg-background p-7 transition-colors hover:bg-secondary"
            >
              <p className="font-heading text-2xl leading-tight">{project.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
              <p className="mt-4 text-xs tracking-[0.08em] text-muted-foreground uppercase">
                {project.status} · {project.primaryCategory}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <SupportCardCta
            title={supportCopy.heading}
            body={supportCopy.body}
            primaryCtaLabel={supportCopy.primaryCtaLabel}
            primaryCtaHref={supportCopy.primaryCtaHref}
            footnote={supportCopy.footnote}
          />
        </div>
      </section>
    </>
  );
}
