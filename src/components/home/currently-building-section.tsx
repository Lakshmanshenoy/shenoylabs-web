import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CurrentlyExploringContent } from "@/lib/homepage-content";

type Props = { content: CurrentlyExploringContent };

const statusLabel = {
  shipped: "Shipped",
  "in-progress": "In Progress",
  planned: "Planned",
} as const;

export function CurrentlyBuildingSection({ content }: Props) {
  return (
    <SectionContainer>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            badge="Currently Exploring"
            title="A live map of active curiosity"
            description="Pillars I keep exploring plus fresh dynamic updates that keep the homepage alive."
          />
          <Link
            href="/currently-building"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "shrink-0 gap-1.5",
            )}
          >
            See What&apos;s Next
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>

        <Card className="reveal border border-border/80 bg-card/95">
          <CardContent className="p-5 sm:p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Dynamic Line
            </p>
            <p className="mt-2 text-sm font-medium text-foreground/90 sm:text-base">
              {content.dynamicLine}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {content.pillars.map((pillar) => (
                <Badge key={pillar} variant="outline" className="text-xs">
                  {pillar}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="reveal-group -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {content.explorationCards.map((item) => (
            <Card
              key={item}
              className="soft-lift min-w-[260px] snap-start border border-border/80 bg-card/95 md:min-w-0"
            >
              <CardContent className="p-5">
                <p className="text-sm leading-relaxed text-foreground/90">{item}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="reveal border border-border/80 bg-card/95">
          <CardContent className="space-y-3 p-5 sm:p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              What&apos;s Next
            </p>
            <div className="space-y-2">
              {content.nextItems.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-wrap items-center gap-2 text-sm"
                >
                  <Badge variant="outline" className="text-xs">
                    {statusLabel[item.status]}
                  </Badge>
                  <span className="text-muted-foreground">{item.date}</span>
                  <span className="text-foreground/90">{item.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionContainer>
  );
}
