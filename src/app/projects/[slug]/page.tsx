import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";

import { InteractionCtaPanel } from "@/components/engagement/interaction-cta-panel";
import { LatestUpdatesStrip } from "@/components/engagement/latest-updates-strip";
import { NewsletterPlaceholder } from "@/components/engagement/newsletter-placeholder";
import { SectionContainer } from "@/components/shared/section-container";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAllProjects, getProject } from "@/lib/content";
import { getCurrentlyExploringContent } from "@/lib/homepage-content";
import { getMDXComponents } from "@/lib/mdx-components";
import {
  getRelatedArticlesForProject,
  getRelatedProjects,
} from "@/lib/recommendations";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

// ─── Static generation ────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((p) => ({ slug: p.slug }));
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
    const { frontmatter: fm } = getProject(slug);
    return {
      title: `${fm.title} — Shenoy Labs`,
      description: fm.description,
      alternates: {
        canonical: `/projects/${slug}`,
      },
      openGraph: {
        title: fm.title,
        description: fm.description,
        type: "website",
        url: `/projects/${slug}`,
        images: [fm.coverImage ?? "/og-default.svg"],
      },
      twitter: {
        card: "summary_large_image",
        title: fm.title,
        description: fm.description,
        images: [fm.coverImage ?? "/og-default.svg"],
      },
    };
  } catch {
    return {};
  }
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const statusConfig = {
  shipped: { color: "bg-emerald-400", label: "Shipped" },
  "in-progress": { color: "bg-amber-400", label: "In Progress" },
  planning: { color: "bg-sky-400", label: "Planning" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let item;
  try {
    item = getProject(slug);
  } catch {
    notFound();
  }

  const { frontmatter: fm, source } = item;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: fm.title, path: `/projects/${slug}` },
  ]);
  const updates = getCurrentlyExploringContent().nextItems;
  const relatedProjects = getRelatedProjects(slug, 3);
  const relatedArticles = getRelatedArticlesForProject(slug, 3);

  const { content } = await compileMDX({
    source,
    components: getMDXComponents(),
    options: { parseFrontmatter: true },
  });

  const status =
    statusConfig[fm.status as keyof typeof statusConfig] ??
    statusConfig["planning"];

  // JSON-LD (SoftwareApplication schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: fm.title,
    description: fm.description,
    applicationCategory: "WebApplication",
    author: {
      "@type": "Person",
      name: "Lakshman Shenoy",
    },
    datePublished: fm.date,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Back link */}
      <Link
        href="/projects"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "-ml-2 mb-8 gap-1.5 text-muted-foreground",
        )}
      >
        ← All projects
      </Link>

      <div className="mb-8">
        <LatestUpdatesStrip updates={updates} />
      </div>

      {/* Project header */}
      <header className="space-y-4">
        {fm.coverImage && (
          <div className="overflow-hidden rounded-xl border border-border/70">
            <Image
              src={fm.coverImage}
              alt={fm.coverAlt ?? `${fm.title} project thumbnail`}
              width={1200}
              height={675}
              className="h-auto w-full"
              priority
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span
              className={cn("inline-block size-2 rounded-full", status.color)}
            />
            {status.label}
          </span>
          <span className="text-sm text-muted-foreground">
            ·{" "}
            {new Date(fm.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </span>
        </div>
        <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {fm.title}
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          {fm.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {fm.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
        </div>

        {/* External links */}
        {(fm.githubUrl ?? fm.liveUrl) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {fm.githubUrl && (
              <a
                href={fm.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-1.5",
                )}
              >
                GitHub ↗
              </a>
            )}
            {fm.liveUrl && (
              <a
                href={fm.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
              >
                Live site ↗
              </a>
            )}
          </div>
        )}
      </header>

      <Separator className="my-8" />

      {/* MDX content */}
      <article className="prose-custom">{content}</article>

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

      <Separator className="my-8" />
      <NewsletterPlaceholder />

      <div className="mt-6">
        <InteractionCtaPanel />
      </div>
    </SectionContainer>
  );
}
