import Link from "next/link";

import { SectionContainer } from "@/components/shared/section-container";
import { Badge } from "@/components/ui/badge";
import { PRIMARY_CATEGORIES } from "@/lib/taxonomy";

export function TaxonomyDiscoveryStrip() {
  return (
    <SectionContainer className="py-8">
      <div className="rounded-xl border border-border/80 bg-card/95 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Explore by topics
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRIMARY_CATEGORIES.map((category) => (
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
