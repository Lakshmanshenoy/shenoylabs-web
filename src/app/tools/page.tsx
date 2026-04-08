import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, ClockIcon, WrenchIcon } from "lucide-react";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllTools } from "@/lib/tools-registry";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tools — Shenoy Labs",
  description:
    "Roadmap and framework for upcoming privacy-safe calculators and mini-apps.",
  alternates: {
    canonical: "/tools",
  },
  openGraph: {
    title: "Tools — Shenoy Labs",
    description:
      "Roadmap and framework for upcoming privacy-safe calculators and mini-apps.",
    type: "website",
    url: "/tools",
    images: ["/og-default.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tools — Shenoy Labs",
    description:
      "Roadmap and framework for upcoming privacy-safe calculators and mini-apps.",
    images: ["/og-default.svg"],
  },
};

const roadmapTiles = [
  {
    quarter: "Q2 2026",
    label: "Finance toolkit",
    items: ["EMI models", "SIP projection scenarios"],
  },
  {
    quarter: "Q3 2026",
    label: "Creator productivity",
    items: ["Resume scoring", "Readability signals"],
  },
  {
    quarter: "Q4 2026",
    label: "Decision support",
    items: ["Research assistant helpers", "Micro planning utilities"],
  },
];

export default function ToolsPage() {
  const tools = getAllTools();

  return (
    <SectionContainer>
      <SectionHeader
        badge="Tools"
        title="Future Tools Framework"
        description="A scalable route architecture for future calculators and mini-apps, with privacy-safe input handling by default."
      />

      <div className="reveal-group mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card
            key={tool.slug}
            className={cn(
              "group relative flex h-full flex-col border bg-card/95",
              tool.status === "coming-soon"
                ? "border-dashed border-border/70"
                : "border-primary/30",
            )}
          >
            <div className="overflow-hidden rounded-t-xl border-b border-border/70">
              <Image
                src={tool.previewImage}
                alt={tool.previewAlt}
                width={1200}
                height={675}
                className="h-auto w-full"
              />
            </div>
            <CardHeader className="pb-2">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {tool.category}
                </Badge>
                <Badge variant={tool.status === "prototype" ? "default" : "secondary"} className="text-[10px]">
                  {tool.status === "prototype" ? "Framework preview" : "Coming soon"}
                </Badge>
              </div>
              <CardTitle className="flex items-start gap-2 text-base leading-snug">
                <WrenchIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                {tool.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 pt-0">
              <p className="text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
              <p className="text-xs text-muted-foreground">{tool.privacyNote}</p>
              <div className="mt-auto flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ClockIcon className="size-3" />
                  ETA {tool.eta}
                </span>
                <Link
                  href={`/tools/${tool.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                >
                  View route
                  <ArrowRightIcon className="size-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 space-y-4">
        <h3 className="font-heading text-xl font-semibold tracking-tight">Roadmap Tiles</h3>
        <div className="reveal-group grid gap-4 md:grid-cols-3">
          {roadmapTiles.map((tile) => (
            <Card key={tile.quarter} className="border border-border/80 bg-secondary/40">
              <CardHeader>
                <Badge variant="outline" className="w-fit text-xs">
                  {tile.quarter}
                </Badge>
                <CardTitle className="text-base">{tile.label}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {tile.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
