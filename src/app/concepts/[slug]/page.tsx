import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionContainer } from "@/components/shared/section-container";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getConceptProfileBySlug,
  getConceptProfiles,
} from "@/lib/ecosystem";

export async function generateStaticParams() {
  return getConceptProfiles().map((concept) => ({ slug: concept.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const concept = getConceptProfileBySlug(slug);
  if (!concept) {
    return {};
  }

  return {
    title: `${concept.label} — Concepts — Shenoy Labs`,
    description: `${concept.label} across investigations, projects, and pathways.`,
    alternates: {
      canonical: `/concepts/${concept.slug}`,
    },
  };
}

export default async function ConceptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const concept = getConceptProfileBySlug(slug);

  if (!concept) {
    notFound();
  }

  return (
    <SectionContainer>
      <Link href="/concepts" className="text-sm text-muted-foreground hover:text-foreground">
        ← All concepts
      </Link>

      <header className="mt-6 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Concept entity</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight">{concept.label}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          This concept currently connects {concept.investigations.length} investigations,
          {" "}{concept.projects.length} projects, {concept.worlds.length} worlds, and
          {" "}{concept.pathways.length} pathways.
        </p>
      </header>

      <section className="mt-8 rounded-xl border border-border/70 bg-card/75 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Connected worlds</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {concept.worlds.map((world) => (
            <Badge key={world} variant="outline" className="text-xs">
              {world}
            </Badge>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      <section className="space-y-2">
        <h2 className="font-heading text-xl font-semibold tracking-tight">Linked investigations</h2>
        <div className="grid gap-2">
          {concept.investigations.map((investigationSlug) => (
            <Link
              key={investigationSlug}
              href={`/articles/${investigationSlug}`}
              className="rounded-lg border border-border/70 px-3 py-2 text-sm transition-colors hover:border-primary/35 hover:text-primary"
            >
              {investigationSlug.replaceAll("-", " ")}
            </Link>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      <section className="space-y-2">
        <h2 className="font-heading text-xl font-semibold tracking-tight">Linked projects</h2>
        <div className="grid gap-2">
          {concept.projects.length > 0 ? (
            concept.projects.map((projectSlug) => (
              <Link
                key={projectSlug}
                href={`/projects/${projectSlug}`}
                className="rounded-lg border border-border/70 px-3 py-2 text-sm transition-colors hover:border-primary/35 hover:text-primary"
              >
                {projectSlug.replaceAll("-", " ")}
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Project links will appear as this concept manifests in new artifacts.
            </p>
          )}
        </div>
      </section>
    </SectionContainer>
  );
}
