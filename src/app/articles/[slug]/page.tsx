import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import fs from "fs";
import path from "path";

import { InteractionCtaPanel } from "@/components/engagement/interaction-cta-panel";
import { SectionContainer } from "@/components/shared/section-container";
import { Badge } from "@/components/ui/badge";
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
        images: [fm.coverImage ?? "/og-default.svg"],
      },
      twitter: {
        card: "summary_large_image",
        title: fm.title,
        description: fm.excerpt,
        images: [fm.coverImage ?? "/og-default.svg"],
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

      {/* Back link */}
      <Link
        href="/articles"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "-ml-2 mb-8 gap-1.5 text-muted-foreground",
        )}
      >
        ← All articles
      </Link>
      {/* Article header */}
      <header className="space-y-4">
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
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{fm.primaryCategory}</Badge>
          <span className="text-sm text-muted-foreground">
            {readingTime} · Created{" "}
            {new Date(createdDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })} · Updated{" "}
            {new Date(lastUpdated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {fm.title}
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          {fm.excerpt}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {fm.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      <Separator className="my-8" />

      {/* MDX content */}
      <article className="prose-custom">{content}</article>

      <Separator className="my-8" />

      {/* Author footer */}
      <footer className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p>
          Written by <span className="font-medium text-foreground">{fm.author}</span>
        </p>
        <p>
          Created{" "}
          {new Date(createdDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p>
          Last updated{" "}
          {new Date(lastUpdated).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </footer>

      <Separator className="my-8" />

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Recommended next reads
        </h2>
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

      {relatedArticles.length > 0 && (
        <>
          <Separator className="my-8" />
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Related articles
            </h2>
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
      )}

      {relatedProjects.length > 0 && (
        <>
          <Separator className="my-8" />
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Related projects
            </h2>
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
      )}

      <Separator className="my-8" />
      <div className="mx-auto max-w-2xl">
        <InteractionCtaPanel />
      </div>
    </SectionContainer>
  );
}
