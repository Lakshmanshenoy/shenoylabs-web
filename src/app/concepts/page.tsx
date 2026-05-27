import type { Metadata } from "next";
import Link from "next/link";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { getConceptProfiles } from "@/lib/ecosystem";

export const metadata: Metadata = {
  title: "Concepts — Shenoy Labs",
  description: "Concept entities connecting investigations, projects, worlds, and pathways.",
  alternates: {
    canonical: "/concepts",
  },
};

export default function ConceptsPage() {
  const concepts = getConceptProfiles();

  return (
    <SectionContainer>
      <SectionHeader
        badge="Concepts"
        title="Semantic continuity layer"
        description="Concepts are connective intellectual tissue across investigations, projects, worlds, and pathways."
      />

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {concepts.map((concept) => (
          <Link
            key={concept.slug}
            href={`/concepts/${concept.slug}`}
            className="rounded-xl border border-border/70 bg-card/85 p-4 transition-colors hover:border-primary/35"
          >
            <h2 className="font-heading text-lg">{concept.label}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {concept.investigations.length} investigations · {concept.projects.length} projects
            </p>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
