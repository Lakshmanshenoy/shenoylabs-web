import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { CurrentlyExploringContent } from "@/lib/homepage-content";

const statusConfig = {
  shipped: { color: "bg-emerald-400", label: "Shipped" },
  "in-progress": { color: "bg-amber-400", label: "In Progress" },
  planned: { color: "bg-muted-foreground/40", label: "Planned" },
};

type Props = { content: CurrentlyExploringContent };

export function CurrentlyBuildingSection({ content }: Props) {
  return (
    <SectionContainer>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            badge="Currently Building"
            title="What's happening right now"
            description="A live changelog of what I'm actively shipping and what's coming next."
          />
          <Link
            href="/currently-building"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "shrink-0 gap-1.5",
            )}
          >
            Full changelog
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>

        <Card className="reveal border border-border/80 bg-card/95">
          <CardContent className="p-0">
            {content.changelog.map((item, index) => {
              const cfg = statusConfig[item.status as keyof typeof statusConfig];
              return (
                <div key={item.title}>
                  <div className="flex gap-4 p-5 sm:gap-6 sm:p-6">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center pt-1">
                      <span
                        className={cn("size-2.5 rounded-full shrink-0", cfg.color)}
                      />
                      {index < content.changelog.length - 1 && (
                        <div className="mt-2 w-px flex-1 bg-border/60" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1 pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {cfg.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.date}
                        </span>
                      </div>
                      <p className="font-medium leading-snug">{item.title}</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {index < content.changelog.length - 1 && (
                    <Separator className="mx-6 w-auto" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </SectionContainer>
  );
}
