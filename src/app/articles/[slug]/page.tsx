import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import fs from "fs";
import path from "path";
import { Clock3Icon, Link2Icon, Share2Icon } from "lucide-react";

import { ArticleReaderEnhancements, type ArticleTocItem } from "@/components/articles/article-reader-enhancements";
import { InteractionCtaPanel } from "@/components/engagement/interaction-cta-panel";
import { SectionContainer } from "@/components/shared/section-container";
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
        images: [`/api/og?title=${encodeURIComponent(fm.title)}&type=article`],
      },
      twitter: {
        card: "summary_large_image",
        title: fm.title,
        description: fm.excerpt,
        images: [`/api/og?title=${encodeURIComponent(fm.title)}&type=article`],
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
  const createdDate = fm.createdDate ?? fm.date;
  const lastUpdated = fm.lastUpdated ?? createdDate;
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
    <SectionContainer>
      <ArticleReaderEnhancements toc={toc} />

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

      <div className="mb-10 border-b border-border py-2">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <Link
            href="/articles"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-2 gap-1.5 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase",
            )}
          >
            ← All Articles
          </Link>
          <p id="reader-progress-text" className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            0% read
          </p>
        </div>
      </div>

      <header className="mx-auto w-full max-w-3xl space-y-5">
        {fm.coverImage && (
          <div className="overflow-hidden rounded-xl border border-border/70">
            {svgCoverHtml ? (
              <div className="w-full" dangerouslySetInnerHTML={{ __html: svgCoverHtml }} />
            ) : fm.coverImage.endsWith?.(".svg") ? (
              // Use a plain <img> for SVGs to avoid the Next Image optimizer issues
              // with SVG content.
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
          <div className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary">
            LS
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Lakshman Shenoy</p>
            <p className="text-xs text-muted-foreground">{new Date(createdDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-4 text-[11px] font-semibold tracking-[0.05em] text-muted-foreground uppercase">
            <span className="inline-flex items-center gap-1.5"><Clock3Icon className="size-3.5" />{readingTime}</span>
            <span className="inline-flex items-center gap-1.5"><Link2Icon className="size-3.5" />Updated {new Date(lastUpdated).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-10 w-full max-w-3xl">
        <article className="prose-custom article-prose">{content}</article>
      </div>

      <section className="mx-auto mt-14 w-full max-w-3xl space-y-5">
        <div className="h-[3px] w-20 bg-foreground" />

        <div className="rounded-lg border border-border bg-secondary/35 p-6">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Share this article</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase transition-colors hover:bg-secondary"
            >
              <Link2Icon className="size-3.5" />
              Explore More
            </Link>
            <Link
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://shenoylabs.com/articles/${slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase transition-colors hover:bg-secondary"
            >
              <Share2Icon className="size-3.5" />
              Share on X
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Continue Reading</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {recommendedReads.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="rounded-md border border-border px-4 py-3 transition-colors hover:border-primary hover:bg-accent/40"
              >
                <p className="text-[10px] font-semibold tracking-[0.1em] text-primary uppercase">
                  {article.frontmatter.primaryCategory}
                </p>
                <p className="mt-1 font-heading text-base leading-tight text-foreground">
                  {article.frontmatter.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{article.readingTime}</p>
              </Link>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        <section className="space-y-3">
          <h3 className="font-heading text-xl font-semibold tracking-tight">Related articles</h3>
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

        <section className="space-y-3">
          <h3 className="font-heading text-xl font-semibold tracking-tight">Related projects</h3>
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

        <div className="mx-auto max-w-2xl">
          <InteractionCtaPanel />
        </div>
      </section>
    </SectionContainer>
  );
}
