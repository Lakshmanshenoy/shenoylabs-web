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
            <time dateTime={createdDate}>
              {new Date(createdDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {" "}· Updated{" "}
            <time dateTime={lastUpdated}>
              {new Date(lastUpdated).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
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

      {(fm.investigation_map?.length || fm.research_worlds?.length || fm.pathways?.length || fm.concepts?.length) && (
        <section className="space-y-6 rounded-2xl border border-border/70 bg-secondary/40 p-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Cognitive Orientation
            </p>
            <h2 className="font-heading mt-1 text-2xl font-semibold tracking-tight">
              Investigation map
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {fm.summary ?? fm.excerpt}
            </p>
          </div>

          {fm.investigation_map?.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {fm.investigation_map.map((node) => (
                <div key={node.label} className="rounded-lg border border-border/70 bg-background px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{node.label}</p>
                  {node.mode ? (
                    <p className="mt-1 text-xs text-muted-foreground capitalize">{node.mode} mode</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-3">
            {fm.research_worlds?.length ? (
              <div>
                <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Research Worlds
                </p>
                <ul className="mt-2 space-y-1 text-sm text-foreground/85">
                  {fm.research_worlds.map((world) => (
                    <li key={world}>{world}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {fm.pathways?.length ? (
              <div>
                <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Pathways
                </p>
                <ul className="mt-2 space-y-1 text-sm text-foreground/85">
                  {fm.pathways.map((pathway) => (
                    <li key={pathway}>{pathway}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {fm.concepts?.length ? (
              <div>
                <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Concepts
                </p>
                <ul className="mt-2 space-y-1 text-sm text-foreground/85">
                  {fm.concepts.map((concept) => (
                    <li key={concept}>{concept}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      )}

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
          <time dateTime={createdDate}>
            {new Date(createdDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </p>
        <p>
          Last updated{" "}
          <time dateTime={lastUpdated}>
            {new Date(lastUpdated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </p>
      </footer>

      <Separator className="my-8" />

      {(fm.temporal_context || fm.re_readability_note || fm.unresolved_questions?.length || fm.continuity_notes?.length) && (
        <section className="space-y-4 rounded-2xl border border-border/70 bg-accent/35 p-6">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Reflective expansion
          </h2>
          {fm.temporal_context ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Temporal context:</span> {fm.temporal_context}
            </p>
          ) : null}
          {fm.re_readability_note ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Re-readability:</span> {fm.re_readability_note}
            </p>
          ) : null}
          {fm.continuity_notes?.length ? (
            <div>
              <p className="text-sm font-medium text-foreground">Continuity notes</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {fm.continuity_notes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {fm.unresolved_questions?.length ? (
            <div>
              <p className="text-sm font-medium text-foreground">Open questions</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {fm.unresolved_questions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}

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
