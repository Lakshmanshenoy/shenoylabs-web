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
import { cn } from "@/lib/utils";

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function InquiryPortal() {
  const investigations = getAllArticles();
  const projects = getAllProjects();

  const featured = investigations
    .filter((item) => item.frontmatter.featured)
    .slice(0, 3);

  const fallbackFeatured = featured.length > 0 ? featured : investigations.slice(0, 3);

  const worlds = unique(
    investigations.flatMap((item) => item.frontmatter.research_worlds),
  ).slice(0, 6);

  const pathways = unique(
    investigations.flatMap((item) => item.frontmatter.pathways),
  ).slice(0, 3);

  const continuity = investigations
    .flatMap((item) => item.frontmatter.related_investigations)
    .slice(0, 3);

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
              <Card key={world} className="scroll-reveal border-border/70 bg-card/85">
                <CardHeader>
                  <CardTitle className="text-lg">{world}</CardTitle>
                  <CardDescription>
                    A conceptual territory in active development through linked investigations.
                  </CardDescription>
                </CardHeader>
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
              <div key={pathway} className="rounded-xl border border-border/70 bg-background/70 p-4">
                <h3 className="font-heading text-lg">{pathway}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  A curated trajectory for moving from foundational ideas to technical implementation.
                </p>
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>

      <SectionContainer className="below-fold bg-secondary/20 py-14">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Exploratory Continuity</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            {projects.length} project artifacts are currently connected to this inquiry ecosystem.
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
