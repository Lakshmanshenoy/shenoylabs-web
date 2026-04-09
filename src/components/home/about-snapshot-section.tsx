import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export function AboutSnapshotSection() {
  return (
    <SectionContainer className="below-fold">
      <div className="flex flex-col gap-8">
        <SectionHeader
          badge="About"
          title="A curious, research-first builder"
          description="I explore automation, finance, science, technology, health, systems thinking, travel, cuisine, and selective media — then turn insights into practical tools and writing."
        />

        <Reveal className="reveal">
          <Card className="reveal border border-border/80 bg-card/95">
            <CardContent className="space-y-4 p-6">
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Shenoy Labs is my long-term space for thoughtful experimentation,
              structured research, and useful work shared in public. The goal is
              simple: solve meaningful problems with clarity, depth, and calm
              execution.
            </p>
            <div>
              <Link
                href="/about"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
              >
                Read More About Me
                <ArrowRightIcon className="size-3.5" />
              </Link>
            </div>
          </CardContent>
          </Card>
        </Reveal>
      </div>
    </SectionContainer>
  );
}
