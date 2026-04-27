import Link from "next/link";

import { SectionContainer } from "@/components/shared/section-container";
import { Badge } from "@/components/ui/badge";
import { getAllArticles, getAllProjects } from "@/lib/content";

export function TaxonomyDiscoveryStrip() {
  // Only surface categories that have at least one article or project so
  // visitors never click through to an empty results page.
  const articles = getAllArticles();
  const projects = getAllProjects();

  const populated = Array.from(
    new Set([
      ...articles.map((a) => a.frontmatter.primaryCategory),
      ...projects.map((p) => p.frontmatter.primaryCategory),
    ]),
  ).filter(Boolean).sort() as string[];

  if (populated.length === 0) return null;

  return (
    <SectionContainer className="below-fold py-8">
      <div className="rounded-xl border border-border/80 bg-card/95 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Explore by topics
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {populated.map((category) => (
            <Link key={category} href={`/search?category=${encodeURIComponent(category)}`}>
              <Badge
                variant="outline"
                className="cursor-pointer text-xs transition-colors hover:border-primary/40 hover:text-primary"
              >
                {category}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
