import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { CtaBlock } from "@/components/shared/cta-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <div>
      <SectionContainer className="pb-6 pt-12 sm:pt-16 lg:pt-20">
        <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-5">
            <Badge variant="outline" className="bg-card">
              Phase 1 Foundation
            </Badge>
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Building a premium hybrid product studio shell.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              This phase delivers the reusable design system, global layout,
              responsive foundation, and security-first defaults for Shenoy Labs.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="h-11 px-6">
                View What I&apos;m Building
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-6">
                Explore Foundation
              </Button>
            </div>
          </div>

          <Card className="soft-lift border border-border/80 bg-card/90">
            <CardHeader>
              <CardTitle>Design System Preview</CardTitle>
              <CardDescription>
                Primitive components and typography are ready for all sections.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Input primitive" />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionContainer>

      <SectionContainer className="border-y border-border/70 bg-secondary/80">
        <SectionHeader
          badge="Global UX"
          title="Layout shell ready for homepage sections"
          description="Responsive containers, section headers, and navigation/footer patterns are implemented and reusable."
        />
      </SectionContainer>

      <SectionContainer>
        <CtaBlock
          title="Phase 1 Complete"
          description="Foundation is in place and ready for premium homepage experience implementation in Phase 2."
          ctaLabel="Review Foundation"
          ctaHref="#"
        />
      </SectionContainer>
    </div>
  );
}
