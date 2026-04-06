import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const featuredProjects = [
  {
    slug: "project-one",
    title: "Project Alpha",
    description:
      "A full-stack application that solves a real product problem from end to end. Built with speed, scalability, and polish in mind.",
    tags: ["Next.js", "TypeScript", "Postgres"],
    status: "Shipped",
    statusColor: "bg-emerald-400",
  },
  {
    slug: "project-two",
    title: "Research Platform",
    description:
      "An open research tool enabling interactive exploration of structured datasets with a clean editorial reading experience.",
    tags: ["React", "MDX", "Visualisation"],
    status: "In Progress",
    statusColor: "bg-amber-400",
  },
  {
    slug: "project-three",
    title: "Tools Engine",
    description:
      "A client-side computation framework for privacy-safe interactive calculators and decision tools.",
    tags: ["TypeScript", "Web Workers", "PWA"],
    status: "Planning",
    statusColor: "bg-sky-400",
  },
];

export function FeaturedProjectsSection() {
  return (
    <SectionContainer className="bg-secondary/50">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            badge="Projects"
            title="Featured work"
            description="A selection of shipped products and ongoing builds."
          />
          <Link
            href="/projects"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "shrink-0 gap-1.5",
            )}
          >
            All projects
            <ExternalLinkIcon className="size-3.5" />
          </Link>
        </div>

        <div className="reveal-group grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
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
                        project.statusColor,
                      )}
                    />
                    <span className="text-xs text-muted-foreground">
                      {project.status}
                    </span>
                  </div>
                  <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="leading-relaxed">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
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
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
