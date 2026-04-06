import type { Metadata } from "next";
import Link from "next/link";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllProjects } from "@/lib/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Projects — Shenoy Labs",
  description:
    "Shipped products, ongoing builds, and planned work by Lakshman Shenoy.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Projects — Shenoy Labs",
    description:
      "Shipped products, ongoing builds, and planned work by Lakshman Shenoy.",
    type: "website",
    url: "/projects",
    images: ["/og-default.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects — Shenoy Labs",
    description:
      "Shipped products, ongoing builds, and planned work by Lakshman Shenoy.",
    images: ["/og-default.svg"],
  },
};

const statusConfig = {
  shipped: { color: "bg-emerald-400", label: "Shipped" },
  "in-progress": { color: "bg-amber-400", label: "In Progress" },
  planning: { color: "bg-sky-400", label: "Planning" },
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <SectionContainer>
      <SectionHeader
        badge="Projects"
        title="All work"
        description="Shipped products, active builds, and future plans — all in one place."
      />

      <div className="reveal-group mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const status =
            statusConfig[project.frontmatter.status] ??
            statusConfig["planning"];
          return (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group block"
            >
              <Card className="soft-lift h-full border border-border/80 bg-card/95 transition-colors group-hover:border-primary/30">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-block size-2 rounded-full",
                        status.color,
                      )}
                    />
                    <span className="text-xs text-muted-foreground">
                      {status.label}
                    </span>
                  </div>
                  <CardTitle className="text-base font-semibold leading-snug transition-colors group-hover:text-primary">
                    {project.frontmatter.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {project.frontmatter.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.frontmatter.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </SectionContainer>
  );
}
