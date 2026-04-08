import type { Metadata } from "next";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPageContent } from "@/lib/content";
import { getMDXComponents } from "@/lib/mdx-components";

export const metadata: Metadata = {
  title: "About — Shenoy Labs",
  description:
    "Lakshman Shenoy is a builder and founder behind Shenoy Labs — a hybrid product studio focused on useful software, research, and tools.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About — Shenoy Labs",
    description:
      "Lakshman Shenoy is a builder and founder behind Shenoy Labs — a hybrid product studio focused on useful software, research, and tools.",
    type: "profile",
    url: "/about",
    images: ["/og-default.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Shenoy Labs",
    description:
      "Lakshman Shenoy is a builder and founder behind Shenoy Labs — a hybrid product studio focused on useful software, research, and tools.",
    images: ["/og-default.svg"],
  },
};

const focusAreas = [
  { label: "Product", description: "Zero-to-one strategy and execution" },
  { label: "Engineering", description: "Full-stack web and application development" },
  { label: "Research", description: "Applied research for better software decisions" },
  { label: "Tools", description: "Privacy-safe calculators and decision aids" },
];

export default async function AboutPage() {
  const page = getPageContent("about");
  const { content: prose } = await compileMDX({
    source: page.source,
    components: getMDXComponents(),
  });

  return (
    <SectionContainer className="max-w-3xl">
      <SectionHeader
        badge="About"
        title="Lakshman Shenoy"
        description="Thinker. Learner. Problem solver."
      />

      <div className="reveal prose prose-neutral dark:prose-invert mt-8 max-w-none text-muted-foreground">
        {prose}
      </div>

      <Separator className="my-8" />

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Focus areas
        </h2>
        <div className="reveal-group grid gap-3 sm:grid-cols-2">
          {focusAreas.map((area) => (
            <Card
              key={area.label}
              className="border border-border/80 bg-card/95"
            >
              <CardContent className="p-4">
                <Badge variant="outline" className="mb-2 text-xs">
                  {area.label}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {area.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          What I am solving
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          Projects, articles, and tools are published openly. If you want to
          follow along or collaborate, start by looking at the work.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/projects" className={buttonVariants({ size: "sm" })}>
            View projects
          </Link>
          <Link
            href="/articles"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Read articles
          </Link>
          <Link
            href="/contact"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Get in touch
          </Link>
        </div>
      </section>
    </SectionContainer>
  );
}
