import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import fs from "fs";
import path from "path";

import { SectionContainer } from "@/components/shared/section-container";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  getCanonResurfacing,
  getHistoricalThreads,
  getTemporalContinuity,
} from "@/lib/canon";
import { getAllArticles, getArticle } from "@/lib/content";
import { getInvestigationContinuity } from "@/lib/ecosystem";
import { getMDXComponents } from "@/lib/mdx-components";
import {
  getRecommendedNextReads,
  getRelatedArticles,
  getRelatedProjectsForArticle,
} from "@/lib/recommendations";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

type HeadingMode = "exploratory" | "technical" | "research" | "transitional";

type InvestigationHeading = {
  id: string;
  title: string;
  level: 2 | 3;
  mode: HeadingMode;
};

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function stripFrontmatter(source: string): string {
  return source.replace(/^---\n[\s\S]*?\n---\n?/, "");
}

function inferMode(title: string): HeadingMode {
  if (/(overview|why|introduction|context|explore|question|philosophy)/i.test(title)) {
    return "exploratory";
  }
  if (/(technical|architecture|implementation|code|api|config|build|integration|runtime)/i.test(title)) {
    return "technical";
  }
  if (/(research|evidence|analysis|reference|framework|benchmark|data|study)/i.test(title)) {
    return "research";
  }
  return "transitional";
}

function parseHeadings(source: string): InvestigationHeading[] {
  const text = stripFrontmatter(source);
  const regex = /^(##|###)\s+(.+)$/gm;
  const seen = new Map<string, number>();
  const headings: InvestigationHeading[] = [];

  for (const match of text.matchAll(regex)) {
    const depth = match[1].length;
    const raw = match[2]
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/[*_`~<>#]/g, "")
      .trim();

    if (!raw) {
      continue;
    }

    const baseId = slugify(raw);
    const duplicateCount = seen.get(baseId) ?? 0;
    seen.set(baseId, duplicateCount + 1);
    const id = duplicateCount === 0 ? baseId : `${baseId}-${duplicateCount + 1}`;

    headings.push({
      id,
      title: raw,
      level: depth === 2 ? 2 : 3,
      mode: inferMode(raw),
    });
  }

  return headings;
}

const modeLabel: Record<HeadingMode, string> = {
  exploratory: "Exploratory",
  technical: "Technical",
  research: "Research",
  transitional: "Transition",
};

const modeClass: Record<HeadingMode, string> = {
  exploratory: "border-sky-300/70 bg-sky-50/40 text-sky-700 dark:text-sky-200",
  technical: "border-amber-300/70 bg-amber-50/40 text-amber-700 dark:text-amber-200",
  research: "border-emerald-300/70 bg-emerald-50/40 text-emerald-700 dark:text-emerald-200",
  transitional: "border-slate-300/70 bg-slate-50/40 text-slate-700 dark:text-slate-200",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { frontmatter: fm } = getArticle(slug);
    const createdDate = fm.createdDate ?? fm.date;
    const lastUpdated = fm.lastUpdated ?? createdDate;

    return {
      title: `${fm.title} — Shenoy Labs`,
      description: fm.summary ?? fm.excerpt,
      alternates: {
        canonical: `/articles/${slug}`,
      },
      openGraph: {
        title: fm.title,
        description: fm.summary ?? fm.excerpt,
        type: "article",
        url: `/articles/${slug}`,
        publishedTime: createdDate,
        modifiedTime: lastUpdated,
        authors: [fm.author],
        tags: fm.tags,
        images: [`/api/og?title=${encodeURIComponent(fm.title)}&type=article`],
      },
      twitter: {
        card: "summary_large_image",
        title: fm.title,
        description: fm.summary ?? fm.excerpt,
        images: [`/api/og?title=${encodeURIComponent(fm.title)}&type=article`],
      },
    };
  } catch {
    return {};
  }
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let item;
  try {
    item = getArticle(slug);
  } catch {
    notFound();
  }

  const { frontmatter: fm, readingTime, source } = item;
  const createdDate = fm.createdDate ?? fm.date;
  const lastUpdated = fm.lastUpdated ?? createdDate;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Articles", path: "/articles" },
    { name: fm.title, path: `/articles/${slug}` },
  ]);
  const recommendedReads = getRecommendedNextReads(slug, 3);
  const relatedArticles = getRelatedArticles(slug, 3);
  const relatedProjects = getRelatedProjectsForArticle(slug, 3);
  const headings = parseHeadings(source);
  const continuity = getInvestigationContinuity(slug);
  const temporal = getTemporalContinuity(slug);
  const canon = getCanonResurfacing(3);
  const historicalThreads = getHistoricalThreads(4);

  const { content } = await compileMDX({
    source,
    components: getMDXComponents(),
    options: { parseFrontmatter: true },
  });

  let svgCoverHtml: string | null = null;
  if (fm.coverImage && fm.coverImage.endsWith(".svg")) {
    try {
      const rel = fm.coverImage.replace(/^\//, "");
      const coverPath = path.join(process.cwd(), "public", rel);
      if (fs.existsSync(coverPath)) {
        let rawSvg = fs.readFileSync(coverPath, "utf8");
        rawSvg = rawSvg.replace(/width="[^"]*"/g, "").replace(/height="[^"]*"/g, "");
        rawSvg = rawSvg.replace(/<svg([^>]*)>/, '<svg$1 style="width:100%;height:auto;display:block">');
        rawSvg = rawSvg
          .replace(/id="title"/g, `id="title-${slug}"`)
          .replace(/id="desc"/g, `id="desc-${slug}"`)
          .replace(/aria-labelledby="title desc"/g, `aria-labelledby="title-${slug} desc-${slug}"`);
        svgCoverHtml = rawSvg;
      }
    } catch {
      svgCoverHtml = null;
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: fm.title,
    description: fm.summary ?? fm.excerpt,
    datePublished: createdDate,
    dateModified: lastUpdated,
    author: {
      "@type": "Person",
      name: fm.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Shenoy Labs",
      url: "https://shenoylabs.com",
    },
    keywords: fm.tags.join(", "),
  };

  return (
    <SectionContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Link
        href="/articles"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "-ml-2 mb-8 gap-1.5 text-muted-foreground",
        )}
      >
        ← All investigations
      </Link>

      <header className="space-y-5">
        {fm.coverImage ? (
          <div className="overflow-hidden rounded-2xl border border-border/70">
            {svgCoverHtml ? (
              <div className="w-full" dangerouslySetInnerHTML={{ __html: svgCoverHtml }} />
            ) : fm.coverImage.endsWith(".svg") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fm.coverImage}
                alt={fm.coverAlt ?? `${fm.title} cover image`}
                className="h-auto w-full"
              />
            ) : (
              <Image
                src={fm.coverImage}
                alt={fm.coverAlt ?? `${fm.title} cover image`}
                width={1200}
                height={675}
                className="h-auto w-full"
                priority
              />
            )}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
          <Badge variant="outline">{fm.primaryCategory}</Badge>
          {fm.investigation_type ? <Badge variant="secondary">{fm.investigation_type}</Badge> : null}
          {fm.canonical_text ? <Badge variant="secondary">Canonical text</Badge> : null}
          <span>{fm.reading_time ?? readingTime}</span>
          <span aria-hidden>·</span>
          <time dateTime={createdDate}>
            {new Date(createdDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span aria-hidden>·</span>
          <time dateTime={lastUpdated}>
            updated {new Date(lastUpdated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        </div>

        <h1 className="font-heading max-w-4xl text-4xl font-semibold leading-[1.14] tracking-tight sm:text-5xl">
          {fm.title}
        </h1>

        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {fm.summary ?? fm.excerpt}
        </p>
      </header>

      <section className="mt-9 space-y-4 rounded-2xl border border-border/70 bg-card/75 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Investigation map</p>
          <span className="text-xs text-muted-foreground">{headings.length} inquiry sections</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {headings.slice(0, 8).map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm transition-colors hover:border-primary/35 hover:text-primary"
            >
              <span className={cn("mr-2 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]", modeClass[heading.mode])}>
                {modeLabel[heading.mode]}
              </span>
              {heading.title}
            </a>
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <main>
          <article className="prose-custom investigation-reading">{content}</article>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="rounded-xl border border-border/70 bg-card/75 p-4">
            <h2 className="font-heading text-base font-semibold tracking-tight">Conceptual orientation</h2>
            <div className="mt-3 space-y-2 text-sm">
              {headings.slice(0, 10).map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className={cn(
                    "block rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground",
                    heading.level === 3 ? "ml-3" : "",
                  )}
                >
                  {heading.title}
                </a>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border/70 bg-card/75 p-4">
            <h2 className="font-heading text-base font-semibold tracking-tight">Connected worlds</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {fm.research_worlds.length > 0 ? (
                fm.research_worlds.map((world) => (
                  <Link
                    key={world}
                    href={`/search?q=${encodeURIComponent(world)}`}
                    className="rounded-full border border-border/70 px-2.5 py-1 text-xs transition-colors hover:border-primary/35 hover:text-primary"
                  >
                    {world}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">World links evolve as investigations grow.</p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {fm.pathways.map((pathway) => (
                <Link
                  key={pathway}
                  href={`/search?q=${encodeURIComponent(pathway)}`}
                  className="rounded-full border border-border/70 px-2.5 py-1 text-xs transition-colors hover:border-primary/35 hover:text-primary"
                >
                  {pathway}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {fm.concepts.map((concept) => (
                <a
                  key={concept}
                  href={`#concept-${slugify(concept)}`}
                  className="rounded-full border border-border/70 px-2.5 py-1 text-xs transition-colors hover:border-primary/35 hover:text-primary"
                >
                  {concept}
                </a>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <Separator className="my-10" />

      <section className="rounded-2xl border border-border/70 bg-card/75 p-5 sm:p-6">
        <h2 className="font-heading text-xl font-semibold tracking-tight">Reflection layer</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          This investigation is one layer in a broader inquiry system. Continue through adjacent
          investigations, projects, and pathways to reconstruct the full intellectual terrain.
        </p>
      </section>

      <Separator className="my-10" />

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold tracking-tight">Expansion layer</h2>
        {continuity.concepts.length > 0 && (
          <div className="grid gap-3 md:grid-cols-3">
            {continuity.concepts.map((concept) => (
              <Link
                key={concept.slug}
                id={`concept-${concept.slug}`}
                href={`/search?q=${encodeURIComponent(concept.label)}`}
                className="rounded-xl border border-border/70 bg-card/75 p-4 transition-colors hover:border-primary/35"
              >
                <p className="font-heading text-base">{concept.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {concept.investigations.length} investigations · {concept.projects.length} projects
                </p>
              </Link>
            ))}
          </div>
        )}
        {continuity.adjacentWorlds.length > 0 ? (
          <div className="rounded-xl border border-border/70 bg-card/65 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Unresolved tensions</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {continuity.adjacentWorlds
                .flatMap((world) => world.unresolvedQuestions)
                .slice(0, 3)
                .map((question) => (
                  <li key={question}>• {question}</li>
                ))}
            </ul>
          </div>
        ) : null}
      </section>

      <Separator className="my-10" />

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold tracking-tight">Temporal depth</h2>
        <p className="text-sm text-muted-foreground">
          This investigation sits inside an evolving timeline. Revisit earlier foundations and later extensions.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Earlier echoes</p>
            <div className="mt-2 grid gap-2">
              {temporal.earlier.length > 0 ? (
                temporal.earlier.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/articles/${item.slug}`}
                    className="rounded-lg border border-border/70 px-3 py-2 text-sm transition-colors hover:border-primary/35 hover:text-primary"
                  >
                    {item.frontmatter.title}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Foundational echoes are still emerging.</p>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Later extensions</p>
            <div className="mt-2 grid gap-2">
              {temporal.later.length > 0 ? (
                temporal.later.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/articles/${item.slug}`}
                    className="rounded-lg border border-border/70 px-3 py-2 text-sm transition-colors hover:border-primary/35 hover:text-primary"
                  >
                    {item.frontmatter.title}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Future layers will continue this line of inquiry.</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {temporal.recurringThemes.map((theme) => (
            <Link
              key={theme}
              href={`/search?q=${encodeURIComponent(theme)}`}
              className="rounded-full border border-border/70 px-2.5 py-1 text-xs transition-colors hover:border-primary/35 hover:text-primary"
            >
              {theme}
            </Link>
          ))}
        </div>
        {historicalThreads.length > 0 && (
          <div className="rounded-xl border border-border/70 bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ecosystem memory</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {historicalThreads.slice(0, 4).map((thread) => (
                <div key={thread.label} className="rounded-lg border border-border/60 bg-background/60 px-3 py-2">
                  <p className="text-sm font-medium">{thread.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {thread.firstSeen.slice(0, 4)} → {thread.lastSeen.slice(0, 4)} · {thread.investigations.length} investigations
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <Separator className="my-10" />

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold tracking-tight">Drift layer</h2>
        <div className="grid gap-2">
          {recommendedReads.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="rounded-lg border border-border/70 px-3 py-2 text-sm transition-colors hover:border-primary/30 hover:text-primary"
            >
              {article.frontmatter.title}
            </Link>
          ))}
        </div>
      </section>

      <Separator className="my-10" />

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold tracking-tight">Canon preservation</h2>
        <div className="grid gap-2">
          {canon
            .filter((entry) => entry.investigation.slug !== slug)
            .slice(0, 3)
            .map((entry) => (
              <Link
                key={entry.investigation.slug}
                href={`/articles/${entry.investigation.slug}`}
                className="rounded-lg border border-border/70 px-3 py-2 text-sm transition-colors hover:border-primary/30 hover:text-primary"
              >
                {entry.investigation.frontmatter.title}
              </Link>
            ))}
        </div>
      </section>

      {relatedArticles.length > 0 ? (
        <>
          <Separator className="my-10" />
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-semibold tracking-tight">Adjacent investigations</h2>
            <div className="grid gap-2">
              {relatedArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="rounded-lg border border-border/70 px-3 py-2 text-sm transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {article.frontmatter.title}
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {relatedProjects.length > 0 ? (
        <>
          <Separator className="my-10" />
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-semibold tracking-tight">Connected projects</h2>
            <div className="grid gap-2">
              {relatedProjects.map((project) => (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="rounded-lg border border-border/70 px-3 py-2 text-sm transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {project.frontmatter.title}
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <Separator className="my-10" />
      <p className="text-center text-sm text-muted-foreground">
        End this reading slowly. Re-enter through a concept, world, or pathway when you revisit.
      </p>
    </SectionContainer>
  );
}
