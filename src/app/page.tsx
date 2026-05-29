import type { Metadata } from "next";
import Link from "next/link";

import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
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
  statusLabel: string;
  statusClassName: string;
  statusDotClassName: string;
  statusPulse?: boolean;
  primaryCategory: string;
  external?: boolean;
};

function mapLocalProjectStatus(status: "shipped" | "in-progress" | "planning") {
  if (status === "shipped") {
    return {
      statusLabel: "Active",
      statusClassName: "bg-emerald-100 text-emerald-700",
      statusDotClassName: "bg-emerald-500",
      statusPulse: true,
    };
  }

  if (status === "in-progress") {
    return {
      statusLabel: "Maintained",
      statusClassName: "bg-sky-100 text-sky-700",
      statusDotClassName: "bg-sky-500",
      statusPulse: false,
    };
  }

  return {
    statusLabel: "Experimental",
    statusClassName: "bg-amber-100 text-amber-700",
    statusDotClassName: "bg-amber-500",
    statusPulse: false,
  };
}

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
      statusLabel: repo.archived ? "Archived" : "Active",
      statusClassName: repo.archived ? "bg-slate-200 text-slate-700" : "bg-emerald-100 text-emerald-700",
      statusDotClassName: repo.archived ? "bg-slate-500" : "bg-emerald-500",
      statusPulse: !repo.archived,
      primaryCategory: repo.language ?? "GitHub",
      external: true,
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
  const localProjectCards: RecentProjectCard[] = allProjects.slice(0, 2).map((project) => {
    const mapped = mapLocalProjectStatus(project.frontmatter.status);
    return {
      title: project.frontmatter.title,
      description: project.frontmatter.description,
      href: `/projects/${project.slug}`,
      statusLabel: mapped.statusLabel,
      statusClassName: mapped.statusClassName,
      statusDotClassName: mapped.statusDotClassName,
      statusPulse: mapped.statusPulse,
      primaryCategory: project.frontmatter.primaryCategory,
      external: false,
    };
  });

  const recentProjects: RecentProjectCard[] = [...localProjectCards, ...githubProjectCards].slice(0, 2);

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
      <section className="env-home border-b border-border/55">
        <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-16 text-center sm:px-6 lg:px-8 lg:pb-16">
          <p className="editorial-kicker">
            {todayLabel}
          </p>
          <h1 className="mt-5 text-6xl leading-[0.93] sm:text-7xl md:text-8xl lg:text-9xl">
            Shenoy<span className="text-primary">.</span>Labs
          </h1>
          <p className="mt-6 text-sm tracking-[0.14em] text-muted-foreground uppercase sm:mt-7 lg:mt-8">
            Think · <span className="text-primary">Learn</span> · Solve
          </p>
          <div className="mx-auto mt-10 flex w-fit flex-wrap justify-center overflow-hidden rounded-full border border-border/70 bg-background/70 backdrop-blur-sm">
            <Link href="/articles" className="border-r border-border/60 px-5 py-2.5 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:bg-secondary hover:text-primary">
              Articles
            </Link>
            <Link href="/projects" className="border-r border-border/60 px-5 py-2.5 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:bg-secondary hover:text-primary">
              Projects
            </Link>
            <Link href="/support" className="px-5 py-2.5 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:bg-secondary hover:text-primary">
              Support Us
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border/55 py-16 md:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="editorial-kicker mb-3 inline-flex items-center gap-2">
            <span className="identity-pip" aria-hidden="true" />
            Available to collaborate · India
          </p>
          <h2 className="font-[family-name:var(--font-body)] mb-5 max-w-2xl text-4xl font-semibold italic leading-tight text-foreground md:text-5xl">
            Research &amp; projects<br />built in public.
          </h2>
          <p className="editorial-deck mb-10 max-w-2xl">
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

      <section className="mx-auto grid w-full max-w-7xl px-4 pt-4 sm:px-6 lg:grid-cols-[2fr_1fr] lg:px-8">
        <div className="py-4 text-center text-[13px] text-muted-foreground tracking-[0.02em] lg:col-span-2">
          Deeply researched articles on technology, science, finance and society written by
          <span className="ml-1 font-semibold text-foreground">Lakshman Shenoy</span>.
        </div>
        <div className="border-border py-12 lg:border-r lg:pr-12">
          <p className="editorial-kicker mb-5 inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1.5 text-primary">
            <span className="identity-pip" aria-hidden="true" />
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

          <div className="mt-12 pt-9">
            <hr className="chapter-rule" />
            <p className="editorial-kicker mb-5 mt-8">
              Recent Articles
            </p>
            <div className="space-y-5">
              {recentArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="block border-b border-border/60 pb-5 transition-colors last:border-none hover:text-primary"
                >
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
                    {article.frontmatter.category ?? "Uncategorised"}
                  </p>
                  <p className="mt-1 font-heading text-2xl leading-tight tracking-tight">{article.frontmatter.title}</p>
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

        <aside className="py-12 lg:pl-11">
          <p className="editorial-kicker mb-5">
            Most Read
          </p>
          <div className="space-y-4">
            {mostRead.map((article, index) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="block border-b border-border/60 pb-4 transition-colors last:border-none hover:text-primary"
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

          <div className="mt-9 pt-6">
            <hr className="chapter-rule" />
            <p className="editorial-kicker mb-4 mt-6">
              Topics
            </p>
            <div className="space-y-1">
              {topics.map(([topic, count]) => (
                <Link
                  key={topic}
                  href={`/articles?category=${encodeURIComponent(topic)}`}
                  className="flex items-center justify-between border-b border-border/60 py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <span>{topic}</span>
                  <span className="text-xs">{count} articles</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="env-projects mx-auto w-full max-w-7xl rounded-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="editorial-kicker inline-flex items-center gap-2">
            <span className="identity-pip" aria-hidden="true" />
            Recent Projects
          </p>
          <Link href="/projects" className="text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground transition-colors hover:text-primary">
            View All →
          </Link>
        </div>
        <div className="grid gap-px rounded-xl border border-border/70 bg-border/80 md:grid-cols-2">
          {recentProjects.length > 0 ? (
            recentProjects.map((project) => {
              const cardBody = (
                <>
                  <p className="font-heading text-2xl leading-tight">{project.title}</p>
                  {project.description ? <p className="mt-2 text-sm text-muted-foreground">{project.description}</p> : null}
                  <div className="mt-4 flex items-center gap-2 text-xs tracking-[0.08em] text-muted-foreground uppercase">
                    <ProjectStatusBadge
                      label={project.statusLabel}
                      className={project.statusClassName}
                      dotClassName={project.statusDotClassName}
                      pulse={project.statusPulse}
                    />
                    <span>· {project.primaryCategory}</span>
                  </div>
                </>
              );

              return project.external ? (
                <a
                  key={`${project.title}-${project.href}`}
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-background/95 p-8 transition-colors hover:bg-secondary"
                >
                  {cardBody}
                </a>
              ) : (
                <Link
                  key={`${project.title}-${project.href}`}
                  href={project.href}
                  className="group bg-background/95 p-8 transition-colors hover:bg-secondary"
                >
                  {cardBody}
                </Link>
              );
            })
          ) : (
            <p className="bg-background/95 p-8 text-sm text-muted-foreground md:col-span-2">
              No recent projects available right now.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
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
