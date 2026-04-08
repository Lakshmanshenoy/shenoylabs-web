import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react";

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
import type { FeaturedProjectsContent } from "@/lib/homepage-content";

type Props = { content: FeaturedProjectsContent };

export function FeaturedProjectsSection({ content }: Props) {
  return (
    <SectionContainer className="below-fold bg-secondary/50">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            badge="Projects"
            title="Featured Projects"
            description="Proof of work through practical systems, research-led builds, and useful tools."
          />
          <Link
            href="/projects"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "shrink-0 gap-1.5",
            )}
          >
            View all projects
            <ExternalLinkIcon className="size-3.5" />
          </Link>
        </div>

        <div className="reveal-group grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.projects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group block"
            >
                <Card className="soft-lift h-full border border-border/80 bg-card/95 transition-colors group-hover:border-primary/30">
                  {project.thumbnail && (
                    <div className="overflow-hidden rounded-t-xl border-b border-border/70">
                      <Image
                        src={project.thumbnail}
                        alt={project.thumbnailAlt ?? `${project.title} thumbnail`}
                        width={1200}
                        height={675}
                        className="h-auto w-full"
                      />
                    </div>
                  )}
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
                    {project.problem}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground/90">Why it matters:</span>{" "}
                    {project.whyItMatters}
                  </p>
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
                  <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
                    View Project
                    <ArrowRightIcon className="size-3.5" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
