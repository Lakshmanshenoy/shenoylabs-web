import Link from "next/link";

import { SectionContainer } from "@/components/shared/section-container";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllArticles, getAllProjects } from "@/lib/content";
import { getCanonResurfacing, getHistoricalThreads } from "@/lib/canon";
import { getEcosystemSnapshot } from "@/lib/ecosystem";
import { cn } from "@/lib/utils";

export function InquiryPortal() {
  const investigations = getAllArticles();
  const projects = getAllProjects();
  const ecosystem = getEcosystemSnapshot();

  const featured = investigations
    .filter((item) => item.frontmatter.featured)
    .slice(0, 3);

  const fallbackFeatured = featured.length > 0 ? featured : investigations.slice(0, 3);

  const worlds = ecosystem.worlds.slice(0, 6);
  const pathways = ecosystem.pathways.slice(0, 3);
  const concepts = ecosystem.concepts.slice(0, 4);
  const canon = getCanonResurfacing(3);
  const historicalThreads = getHistoricalThreads(3);

  const continuity = investigations
    .flatMap((item) => item.frontmatter.related_investigations)
    .slice(0, 2);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="blob-drift absolute -left-16 top-12 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="blob-drift-2 absolute -right-12 top-28 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <SectionContainer className="py-24 sm:py-30">
          <div className="reveal-group mx-auto max-w-4xl space-y-8 text-center">
            <Badge variant="outline" className="mx-auto border-border/80 bg-card/70">
              Intellectual Portal
            </Badge>
            <h1 className="font-heading text-4xl leading-tight tracking-tight sm:text-6xl">
              Inquiry-first publishing for systems, infrastructure, and technical depth.
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Shenoy Labs is evolving into an interconnected research environment: investigations,
              conceptual pathways, and technical artifacts composed for calm reading and deep exploration.
            </p>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {ecosystem.investigationCount} investigations, {ecosystem.worldCount} research worlds,
              {" "}{ecosystem.pathwayCount} pathways, and {ecosystem.conceptCount} recurring concepts are
              currently shaping the ecosystem.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/articles" className={cn(buttonVariants({ size: "lg" }), "h-12 px-7")}>
                Enter Investigations
              </Link>
              <Link
                href="/projects"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 px-7")}
              >
                Explore Projects
              </Link>
            </div>
          </div>
        </SectionContainer>
      </section>

      <SectionContainer className="below-fold py-14">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Research Worlds</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {worlds.map((world) => (
              <Card key={world.slug} className="scroll-reveal border-border/70 bg-card/85">
                <CardHeader>
                  <CardTitle className="text-lg">{world.label}</CardTitle>
                  <CardDescription>
                    {world.investigations.length} investigations, {world.concepts.length} concepts, and
                    {" "}{world.pathways.length} pathways currently converge in this world.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {world.concepts.slice(0, 3).map((concept) => (
                      <Badge key={concept} variant="outline" className="text-[10px]">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SectionContainer>

      <SectionContainer className="below-fold bg-secondary/30 py-14">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Curated Investigations</p>
          <div className="grid gap-4 lg:grid-cols-3">
            {fallbackFeatured.map((investigation) => (
              <Link key={investigation.slug} href={`/articles/${investigation.slug}`} className="group block">
                <Card className="soft-lift h-full border-border/70 bg-card/90 transition-colors group-hover:border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">{investigation.frontmatter.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {investigation.frontmatter.summary ?? investigation.frontmatter.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {investigation.frontmatter.concepts.slice(0, 3).map((concept) => (
                        <Badge key={concept} variant="outline" className="text-xs">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </SectionContainer>

      <SectionContainer className="below-fold py-14">
        <div className="space-y-6 rounded-2xl border border-border/70 bg-card/70 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Guided Pathways</p>
          <div className="grid gap-4 md:grid-cols-3">
            {pathways.map((pathway) => (
              <div key={pathway.slug} className="rounded-xl border border-border/70 bg-background/70 p-4">
                <h3 className="font-heading text-lg">{pathway.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {pathway.depthStages.join(" → ")} through {pathway.investigations.length} linked
                  investigations.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pathway.concepts.slice(0, 3).map((concept) => (
                    <Badge key={concept} variant="secondary" className="text-[10px]">
                      {concept}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>

      <SectionContainer className="below-fold py-14">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Concept Continuity</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {concepts.map((concept) => (
              <Link
                key={concept.slug}
                href={`/search?q=${encodeURIComponent(concept.label)}`}
                className="rounded-xl border border-border/70 bg-card/85 p-4 transition-colors hover:border-primary/40"
              >
                <p className="font-heading text-base">{concept.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {concept.investigations.length} investigations · {concept.projects.length} projects
                </p>
              </Link>
            ))}
          </div>
          {historicalThreads.length > 0 && (
            <div className="rounded-xl border border-border/70 bg-card/75 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Historical Threads</p>
              <div className="mt-2 grid gap-2 md:grid-cols-3">
                {historicalThreads.map((thread) => (
                  <div key={thread.label} className="rounded-lg border border-border/60 bg-background/60 p-3">
                    <p className="font-heading text-sm">{thread.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {thread.firstSeen.slice(0, 4)} → {thread.lastSeen.slice(0, 4)} · {thread.investigations.length} investigations
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SectionContainer>

      <SectionContainer className="below-fold bg-secondary/20 py-14">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Exploratory Continuity</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {continuity.map((slug) => (
              <Link
                key={slug}
                href={`/articles/${slug}`}
                className="rounded-xl border border-border/70 bg-card/85 px-4 py-3 text-sm transition-colors hover:border-primary/40 hover:text-primary"
              >
                Continue with {slug.replaceAll("-", " ")}
              </Link>
            ))}
            {continuity.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/70 px-4 py-3 text-sm text-muted-foreground">
                Continuity links expand as more investigations are published.
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border/70 bg-card/85 p-4 text-sm text-muted-foreground">
            {projects.length} project artifacts are connected; ecosystem overlap now spans
            {" "}{ecosystem.conceptCount} concepts and {ecosystem.worldCount} worlds.
          </div>
          <p className="text-sm text-muted-foreground">
            Not every connection is surfaced. Some relationships are intentionally left quiet for future rediscovery.
          </p>
        </div>
      </SectionContainer>

      <SectionContainer className="below-fold py-14">
        <div className="space-y-6 rounded-2xl border border-border/70 bg-card/70 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Foundational Canon</p>
          <div className="grid gap-3 md:grid-cols-3">
            {canon.map((entry) => (
              <Link
                key={entry.investigation.slug}
                href={`/articles/${entry.investigation.slug}`}
                className="rounded-xl border border-border/70 bg-background/70 p-4 transition-colors hover:border-primary/35"
              >
                <p className="font-heading text-lg leading-snug">{entry.investigation.frontmatter.title}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Canon text · {entry.inboundReferences} ecosystem callbacks
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {entry.recurringConcepts.join(" · ")}
                </p>
              </Link>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Canon texts are stewarded references that hold conceptual continuity over time.
          </p>
        </div>
      </SectionContainer>
    </>
  );
}
