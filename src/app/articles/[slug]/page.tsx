import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import fs from "fs";
import path from "path";
import { CalendarDaysIcon, Clock3Icon, Link2Icon } from "lucide-react";

import {
  ArticleReaderEnhancements,
  ArticleTocSidebar,
  type ArticleTocItem,
} from "@/components/articles/article-reader-enhancements";
import { InteractionCtaPanel } from "@/components/engagement/interaction-cta-panel";
import { SectionContainer } from "@/components/shared/section-container";
import {
  LinkedInBrandIcon,
  TelegramBrandIcon,
  WhatsAppBrandIcon,
  XBrandIcon,
} from "@/components/shared/social-brand-icons";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAllArticles, getArticle } from "@/lib/content";
import { getMDXComponents } from "@/lib/mdx-components";
import {
  getRecommendedNextReads,
  getRelatedArticles,
  getRelatedProjectsForArticle,
} from "@/lib/recommendations";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

function stripFrontmatter(source: string): string {
  return source.replace(/^---[\s\S]*?---\s*/m, "");
}

function headingSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildTocFromSource(source: string): ArticleTocItem[] {
  const body = stripFrontmatter(source);
  const lines = body.split("\n");
  const toc: ArticleTocItem[] = [];

  for (const line of lines) {
    const match = /^(##|###)\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    const level = match[1] === "###" ? 3 : 2;
    const title = match[2]
      .replace(/[*_`#\[\]]/g, "")
      .replace(/\(.+?\)/g, "")
      .trim();
    if (!title) continue;
    toc.push({ id: headingSlug(title), title, level });
  }

  return toc;
}

function extractReadingMinutes(readingTime: string): number {
  const match = /(\d+)/.exec(readingTime);
  if (!match) return 6;
  return Math.max(1, Number.parseInt(match[1], 10));
}

function buildVersionSummary(createdDate: string, lastUpdated: string, customSummary?: string): string {
  if (customSummary && customSummary.trim().length > 0) {
    return customSummary.trim();
  }

  const created = new Date(createdDate);
  const updated = new Date(lastUpdated);
  const deltaDays = Math.max(0, Math.floor((updated.getTime() - created.getTime()) / 86400000));

  if (deltaDays === 0) {
    return "Initial publication version with baseline guidance and structure.";
  }
  if (deltaDays <= 14) {
    return "Refreshed recently with updated details, tighter explanations, and quality-of-life edits.";
  }
  return "Maintained edition reflecting later updates in examples, wording, and implementation notes.";
}

// ─── Static generation ────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

// ─── Metadata ─────────────────────────────────────────────────────────────────

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
    const socialImage = fm.coverImage
      ? [fm.coverImage]
      : [`/api/og?title=${encodeURIComponent(fm.title)}&type=article`];

    return {
      title: `${fm.title} — Shenoy Labs`,
      description: fm.excerpt,
      alternates: {
        canonical: `/articles/${slug}`,
      },
      openGraph: {
        title: fm.title,
        description: fm.excerpt,
        type: "article",
        url: `/articles/${slug}`,
        publishedTime: createdDate,
        modifiedTime: lastUpdated,
        authors: [fm.author],
        tags: fm.tags,
        images: socialImage,
      },
      twitter: {
        card: "summary_large_image",
        title: fm.title,
        description: fm.excerpt,
        images: socialImage,
      },
    };
  } catch {
    return {};
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
  const readingTimeMinutes = extractReadingMinutes(readingTime);
  const createdDate = fm.createdDate ?? fm.date;
  const lastUpdated = fm.lastUpdated ?? createdDate;
  const createdDateLabel = new Date(createdDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const updatedDateLabel = new Date(lastUpdated).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const versionNumber = Math.max(
    1,
    Math.floor((new Date(lastUpdated).getTime() - new Date(createdDate).getTime()) / 86400000) + 1,
  );
  const versionLabel = `v${versionNumber}.0`;
  const versionSummary = buildVersionSummary(
    createdDate,
    lastUpdated,
    (fm as { updateSummary?: string }).updateSummary,
  );
  const toc = buildTocFromSource(source);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Articles", path: "/articles" },
    { name: fm.title, path: `/articles/${slug}` },
  ]);
  const recommendedReads = getRecommendedNextReads(slug, 3);
  const relatedArticles = getRelatedArticles(slug, 3);
  const relatedProjects = getRelatedProjectsForArticle(slug, 3);

  const { content } = await compileMDX({
    source,
    components: getMDXComponents(),
    options: { parseFrontmatter: true },
  });

  // If the cover is an SVG in /public, inline it server-side so it always
  // renders reliably on the client. We also strip fixed width/height so the
  // SVG scales responsively and namespace a11y ids to avoid duplicates.
  let svgCoverHtml: string | null = null;
  if (fm.coverImage && fm.coverImage.endsWith?.(".svg")) {
    try {
      const rel = fm.coverImage.replace(/^\//, "");
      const coverPath = path.join(process.cwd(), "public", rel);
      if (fs.existsSync(coverPath)) {
        let rawSvg = fs.readFileSync(coverPath, "utf8");
        // remove fixed width/height to allow responsive scaling, then ensure
        // the svg root scales to the container via an inline style
        rawSvg = rawSvg.replace(/width="[^"]*"/g, "").replace(/height="[^"]*"/g, "");
        rawSvg = rawSvg.replace(/<svg([^>]*)>/, '<svg$1 style="width:100%;height:auto;display:block">');
        // namespace common ids used for accessibility
        rawSvg = rawSvg
          .replace(/id="title"/g, `id="title-${slug}"`)
          .replace(/id="desc"/g, `id="desc-${slug}"`)
          .replace(/aria-labelledby="title desc"/g, `aria-labelledby="title-${slug} desc-${slug}"`);
        svgCoverHtml = rawSvg;
      }
    } catch (e) {
      // fall back to normal <img> if anything goes wrong
      svgCoverHtml = null;
    }
  }

  // JSON-LD (Article schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: fm.title,
    description: fm.excerpt,
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
    <SectionContainer className="py-6 lg:py-8">
      {/* Global reader enhancements: top progress bar, selection popover, long-session watcher */}
      <ArticleReaderEnhancements
        toc={toc}
        readingTimeMinutes={readingTimeMinutes}
        createdDateLabel={createdDateLabel}
        updatedDateLabel={updatedDateLabel}
        versionLabel={versionLabel}
        versionSummary={versionSummary}
      />

      {/* JSON-LD */}
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

      {/* Top reader bar — full width above the layout grid */}
      <div className="sticky top-0 z-20 mb-5 border-b border-border bg-background/95 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <Link
            href="/articles"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-2 gap-1.5 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase",
            )}
          >
            ← All Articles
          </Link>
          <p
            id="reader-progress-text"
            className="font-mono text-[11px] text-muted-foreground/60"
          >
            Reading mode
          </p>
        </div>
      </div>

      {/* Two-column layout: sticky left TOC + content */}
      <div className="xl:h-[calc(100vh-11rem)] xl:overflow-hidden">
        <div className="xl:grid xl:h-full xl:grid-cols-[minmax(18rem,max-content)_minmax(0,1fr)] xl:items-start xl:gap-8 2xl:gap-12">
        {/* Left TOC — visible at xl+ only, rendered by the ArticleTocSidebar client component */}
        <ArticleTocSidebar toc={toc} />

        {/* Primary content column */}
        <div id="reader-scroll-pane" className="min-w-0 xl:h-full xl:overflow-y-auto xl:pr-2">
          <header className="space-y-5">
            {fm.coverImage && (
              <div className="overflow-hidden rounded-xl border border-border/70">
                {svgCoverHtml ? (
                  <div className="w-full" dangerouslySetInnerHTML={{ __html: svgCoverHtml }} />
                ) : fm.coverImage.endsWith?.(".svg") ? (
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
            )}

            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] text-primary uppercase">
              <span className="inline-block size-1.5 rounded-full bg-primary" />
              {fm.primaryCategory}
            </p>

            <h1 className="font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              {fm.title}
            </h1>

            <p className="border-l-4 border-primary pl-5 text-xl leading-relaxed text-muted-foreground italic">
              {fm.excerpt}
            </p>

            <div className="flex items-center gap-3 border-y border-border py-4">
              <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary">
                LS
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Lakshman Shenoy</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(createdDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="ml-auto flex flex-wrap items-center gap-4 text-[11px] font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3Icon className="size-3.5" />
                  {readingTime}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDaysIcon className="size-3.5" />
                  Created {createdDateLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Link2Icon className="size-3.5" />
                  Updated {updatedDateLabel}
                </span>
              </div>
            </div>
          </header>

          {/* Article body — id used by selection tracking and long-session opt */}
          <article id="article-body" className="prose-custom article-prose mt-10">
            {content}
          </article>

          {/* Post-article sections */}
          <section className="mt-14 space-y-8">
            <div className="h-[3px] w-16 rounded-full bg-foreground/20" />

            {/* Share */}
            <div className="rounded-xl border border-border bg-secondary/30 p-6">
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                Share this article
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select any passage while reading to share a specific quote.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Link2Icon className="size-3.5" />
                  Explore More →
                </Link>
                <Link
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://shenoylabs.com/articles/${slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on X"
                  title="Share on X"
                  className="inline-flex items-center rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <XBrandIcon className="size-4" />
                </Link>
                <Link
                  href={`https://wa.me/?text=${encodeURIComponent(`https://shenoylabs.com/articles/${slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on WhatsApp"
                  title="Share on WhatsApp"
                  className="inline-flex items-center rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <WhatsAppBrandIcon className="size-4" />
                </Link>
                <Link
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://shenoylabs.com/articles/${slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on LinkedIn"
                  title="Share on LinkedIn"
                  className="inline-flex items-center rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <LinkedInBrandIcon className="size-4" />
                </Link>
                <Link
                  href={`https://t.me/share/url?url=${encodeURIComponent(`https://shenoylabs.com/articles/${slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Telegram"
                  title="Share on Telegram"
                  className="inline-flex items-center rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <TelegramBrandIcon className="size-4" />
                </Link>
              </div>
            </div>

            {/* Continue reading */}
            {recommendedReads.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold tracking-tight">
                  Continue Reading
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {recommendedReads.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/articles/${article.slug}`}
                      className="group rounded-xl border border-border px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/30 hover:shadow-md"
                    >
                      <p className="text-[10px] font-semibold tracking-[0.1em] text-primary uppercase">
                        {article.frontmatter.primaryCategory}
                      </p>
                      <p className="mt-1.5 font-heading text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {article.frontmatter.title}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {article.readingTime}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Related articles */}
            {relatedArticles.length > 0 && (
              <section className="space-y-3">
                <h3 className="font-heading text-lg font-semibold tracking-tight">
                  Related articles
                </h3>
                <div className="grid gap-2">
                  {relatedArticles.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/articles/${article.slug}`}
                      className="rounded-lg border border-border/70 px-3 py-2 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-sm"
                    >
                      <p className="font-medium">{article.frontmatter.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{article.readingTime}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Related projects */}
            {relatedProjects.length > 0 && (
              <section className="space-y-3">
                <h3 className="font-heading text-lg font-semibold tracking-tight">
                  Related projects
                </h3>
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
            )}

            <div>
              <InteractionCtaPanel />
            </div>
          </section>
        </div>
      </div>
      </div>
    </SectionContainer>
  );
}
