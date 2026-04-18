import Link from "next/link";
import { ArrowRightIcon, BeakerIcon, WrenchIcon } from "lucide-react";

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

type FeaturedTool = {
  slug: string;
  href: string;
  title: string;
  tagline: string;
  tags: string[];
  icon: React.ReactNode;
};

const featuredTools: FeaturedTool[] = [
  {
    slug: "caffilab",
    href: "/caffilab",
    title: "CaffiLab",
    tagline:
      "Scientific caffeine estimation for your exact brew — powered by extraction science, not static tables.",
    tags: ["caffeine", "coffee", "calculator"],
    icon: <BeakerIcon className="size-5" />,
  },
];

export function FeaturedToolsSection() {
  return (
    <SectionContainer className="below-fold">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            badge="Tools"
            title="Featured Tools"
            description="Free, research-backed utilities built to solve real problems."
          />
          <Link
            href="/tools"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "shrink-0 gap-1.5",
            )}
          >
            View all tools
            <WrenchIcon className="size-3.5" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((tool) => (
            <Link key={tool.slug} href={tool.href} className="group block">
              <Card className="h-full border border-border/80 bg-card/95 transition-colors group-hover:border-primary/30">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-primary">{tool.icon}</span>
                    <Badge variant="default" className="text-xs">
                      Live
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-semibold transition-colors group-hover:text-primary">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="leading-relaxed">
                    {tool.tagline}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {tool.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
                    Open Tool
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
