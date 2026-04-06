import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";

import { SectionContainer } from "@/components/shared/section-container";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAllArticles, getArticle } from "@/lib/content";
import { getMDXComponents } from "@/lib/mdx-components";
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
        publishedTime: fm.date,
        authors: [fm.author],
        tags: fm.tags,
        images: ["/og-default.svg"],
      },
      twitter: {
        card: "summary_large_image",
        title: fm.title,
        description: fm.excerpt,
        images: ["/og-default.svg"],
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

  const { content } = await compileMDX({
    source,
    components: getMDXComponents(),
    options: { parseFrontmatter: true },
  });

  // JSON-LD (Article schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: fm.title,
    description: fm.excerpt,
    datePublished: fm.date,
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
    <SectionContainer className="max-w-3xl">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
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
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{fm.category}</Badge>
          <span className="text-sm text-muted-foreground">
            {readingTime} ·{" "}
            {new Date(fm.date).toLocaleDateString("en-US", {
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
          Published{" "}
          {new Date(fm.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </footer>
    </SectionContainer>
  );
}
