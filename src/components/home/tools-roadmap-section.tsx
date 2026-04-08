import Link from "next/link";
import { ArrowRightIcon, ClockIcon, WrenchIcon } from "lucide-react";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toolPlaceholders = [
  {
    title: "Loan EMI Calculator",
    description:
      "Compute monthly instalments, total interest, and amortisation schedules — all client-side, zero data storage.",
    category: "Finance",
    eta: "Q2 2026",
  },
  {
    title: "SIP Returns Planner",
    description:
      "Model long-term wealth accumulation from systematic investment plans with customisable inflation adjustments.",
    category: "Finance",
    eta: "Q2 2026",
  },
  {
    title: "Resume Scorer",
    description:
      "Analyse a resume against a job description and get an actionable match score — runs fully in-browser.",
    category: "Productivity",
    eta: "Q3 2026",
  },
  {
    title: "Readability Analyser",
    description:
      "Measure Flesch-Kincaid, sentence complexity, and passive voice density for clear editorial writing.",
    category: "Writing",
    eta: "Q3 2026",
  },
];

export function ToolsRoadmapSection() {
  return (
    <SectionContainer className="below-fold">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            badge="Tools"
            title="Interactive tools — coming soon"
            description="Privacy-safe client-side calculators and decision aids. No data leaves your device."
          />
          <Link
            href="/tools"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "shrink-0 gap-1.5",
            )}
          >
            View roadmap
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>

        <div className="reveal-group grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {toolPlaceholders.map((tool) => (
            <Card
              key={tool.title}
              className="group relative flex flex-col border border-dashed border-border/60 bg-secondary/40 transition-colors hover:border-primary/30 hover:bg-card"
            >
              <CardHeader className="pb-2">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {tool.category}
                  </Badge>
                </div>
                <CardTitle className="flex items-start gap-2 text-sm font-medium leading-snug">
                  <WrenchIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  {tool.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4 pt-0">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ClockIcon className="size-3" />
                  ETA {tool.eta}
                </div>
              </CardContent>
              {/* Coming soon overlay */}
              <div className="pointer-events-none absolute right-3 top-3">
                <Badge
                  variant="secondary"
                  className="bg-muted/70 text-[10px] font-medium text-muted-foreground"
                >
                  Coming soon
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
