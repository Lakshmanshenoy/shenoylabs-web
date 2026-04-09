import type { Metadata } from "next";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Currently Building — Shenoy Labs",
  description:
    "A live changelog tracking what Lakshman Shenoy is actively shipping at Shenoy Labs.",
  alternates: {
    canonical: "/currently-building",
  },
  openGraph: {
    title: "Currently Building — Shenoy Labs",
    description:
      "A live changelog tracking what Lakshman Shenoy is actively shipping at Shenoy Labs.",
    type: "website",
    url: "/currently-building",
    images: ["/og-default.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Currently Building — Shenoy Labs",
    description:
      "A live changelog tracking what Lakshman Shenoy is actively shipping at Shenoy Labs.",
    images: ["/og-default.svg"],
  },
};

const statusConfig = {
  shipped: { color: "bg-emerald-400", label: "Shipped" },
  "in-progress": { color: "bg-amber-400", label: "In Progress" },
  planned: { color: "bg-muted-foreground/40", label: "Planned" },
};

const changelog = [
  {
    date: "Apr 2026",
    title: "Phase 6 — Future Tools Framework",
    description:
      "Built the /tools route architecture, tools registry, client-side compute framework with sanitized inputs, and dynamic /tools/[slug] pages.",
    status: "shipped",
  },
  {
    date: "Apr 2026",
    title: "Phase 5 — SEO, Analytics & Performance",
    description:
      "Integrated Google Analytics, generated sitemap/robots, added canonical URLs, Open Graph metadata, and OG preview image across all routes.",
    status: "shipped",
  },
  {
    date: "Apr 2026",
    title: "Phase 4 — Support, Contact & Legal",
    description:
      "Built /contact with secure spam-protected form and Resend email delivery, /support with Razorpay/UPI placeholders, finalized privacy policy, terms, and refund policy.",
    status: "shipped",
  },
  {
    date: "Apr 2026",
    title: "Phase 3 — MDX Content Engine",
    description:
      "MDX pipeline wired, dynamic /articles/[slug] and /projects/[slug] pages with reading time, article schema, CMS-ready architecture.",
    status: "shipped",
  },
  {
    date: "Apr 2026",
    title: "Phase 2 — Homepage Experience",
    description:
      "Premium homepage with hero, featured projects, tools roadmap, articles preview, changelog, and support CTA sections.",
    status: "shipped",
  },
  {
    date: "Apr 2026",
    title: "Phase 1 — Design System & Layout Shell",
    description:
      "Design tokens, Manrope + Inter typography, shadcn/ui primitives, sticky navbar, mobile drawer, footer, security headers, and favicon.",
    status: "shipped",
  },
  {
    date: "Q3 2026",
    title: "Finance & productivity tools — first release",
    description:
      "Loan EMI calculator and SIP returns planner shipping as the first real interactive tools.",
    status: "planned",
  },
  {
    date: "Q3 2026",
    title: "CMS migration for content",
    description:
      "Planning migration from file-based MDX to a headless CMS to support faster editorial publishing.",
    status: "planned",
  },
];

export default function CurrentlyBuildingPage() {
  const shipped = changelog.filter((e) => e.status === "shipped");
  const upcoming = changelog.filter((e) => e.status !== "shipped");

  return (
    <SectionContainer>
      <SectionHeader
        badge="Currently Building"
        title="Full Changelog"
        description="Everything shipped, in progress, and planned — updated whenever something significant moves."
      />

      <div className="mt-10 space-y-10">
        {[
          { heading: "Shipped", items: shipped },
          { heading: "Upcoming", items: upcoming },
        ].map(({ heading, items }) => (
          <section key={heading} className="space-y-4">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              {heading}
            </h2>
            <Reveal className="reveal">
              <Card className="reveal border border-border/80 bg-card/95">
                <CardContent className="p-0">
                {items.map((item, index) => {
                  const cfg =
                    statusConfig[item.status as keyof typeof statusConfig];
                  return (
                    <div key={item.title}>
                      <div className="flex gap-4 p-5 sm:gap-6 sm:p-6">
                        <div className="flex flex-col items-center pt-1">
                          <span
                            className={cn(
                              "size-2.5 shrink-0 rounded-full",
                              cfg.color,
                            )}
                          />
                          {index < items.length - 1 && (
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
                          <p className="font-medium leading-snug">
                            {item.title}
                          </p>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      {index < items.length - 1 && (
                        <Separator className="mx-6 w-auto" />
                      )}
                    </div>
                  );
                })}
              </CardContent>
              </Card>
            </Reveal>
          </section>
        ))}
      </div>
    </SectionContainer>
  );
}
