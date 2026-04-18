import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, BeakerIcon, WrenchIcon } from "lucide-react";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Tools | Shenoy Labs",
  description:
    "Free, research-backed tools built by Shenoy Labs — caffeine calculators, analyzers, planners, and more.",
  alternates: { canonical: "/tools" },
};

type Tool = {
  slug: string;
  href: string;
  title: string;
  description: string;
  status: "live" | "coming-soon";
  tags: string[];
  icon: React.ReactNode;
  thumbnail?: string;
  thumbnailAlt?: string;
};

const tools: Tool[] = [
  {
    slug: "caffilab",
    href: "/caffilab",
    title: "CaffiLab",
    description:
      "Scientific caffeine estimation for your exact brew. Enter your coffee dose, bean type, brew method, and extraction variables to get a calibrated caffeine estimate with confidence range.",
    status: "live",
    tags: ["caffeine", "coffee", "calculator", "science"],
    icon: <BeakerIcon className="size-5" />,
    thumbnail: "/images/caffilab/drip-brewing.jpg",
    thumbnailAlt: "Coffee dripping into a glass vessel",
  },
];

export default function ToolsPage() {
  return (
    <SectionContainer>
      <div className="flex flex-col gap-10">
        <SectionHeader
          badge="Tools"
          title="Shenoy Labs Tools"
          description="Free, research-backed utilities built to solve real problems. Each tool is grounded in data, open methodology, and practical design."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link key={tool.slug} href={tool.href} className="group block">
              <Card className="h-full border border-border/80 bg-card/95 transition-colors group-hover:border-primary/30">
                {tool.thumbnail && (
                  <div className="overflow-hidden rounded-t-xl border-b border-border/70">
                    <Image
                      src={tool.thumbnail}
                      alt={tool.thumbnailAlt ?? `${tool.title} thumbnail`}
                      width={1200}
                      height={675}
                      className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-primary">{tool.icon}</span>
                    <Badge
                      variant={tool.status === "live" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {tool.status === "live" ? "Live" : "Coming Soon"}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-semibold transition-colors group-hover:text-primary">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="leading-relaxed">
                    {tool.description}
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
                    {tool.status === "live" ? "Open Tool" : "Learn More"}
                    <ArrowRightIcon className="size-3.5" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {tools.length === 1 && (
          <div className="rounded-xl border border-dashed border-border/60 bg-secondary/30 p-8 text-center">
            <WrenchIcon className="mx-auto mb-3 size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              More tools are on the way. Check back soon or{" "}
              <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">
                suggest a tool
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
