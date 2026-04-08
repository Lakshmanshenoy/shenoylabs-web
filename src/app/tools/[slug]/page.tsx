import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { LocalComputeLab } from "@/components/tools/local-compute-lab";
import { SectionContainer } from "@/components/shared/section-container";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAllTools, getToolBySlug } from "@/lib/tools-registry";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  return getAllTools().map((tool) => ({ slug: tool.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) return {};

  return {
    title: `${tool.title} — Shenoy Labs`,
    description: tool.description,
    alternates: {
      canonical: `/tools/${slug}`,
    },
    openGraph: {
      title: `${tool.title} — Shenoy Labs`,
      description: tool.description,
      type: "website",
      url: `/tools/${slug}`,
      images: [tool.previewImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.title} — Shenoy Labs`,
      description: tool.description,
      images: [tool.previewImage],
    },
  };
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) notFound();

  const isPrototype = tool.status === "prototype";

  return (
    <SectionContainer className="max-w-4xl">
      <Link
        href="/tools"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "-ml-2 mb-8 gap-1.5 text-muted-foreground",
        )}
      >
        ← All tools
      </Link>

      <header className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-border/70">
          <Image
            src={tool.previewImage}
            alt={tool.previewAlt}
            width={1200}
            height={675}
            className="h-auto w-full"
            priority
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{tool.category}</Badge>
          <Badge variant={isPrototype ? "default" : "secondary"}>
            {isPrototype ? "Framework preview" : "Coming soon"}
          </Badge>
          <span className="text-sm text-muted-foreground">ETA {tool.eta}</span>
        </div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {tool.title}
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">{tool.description}</p>
      </header>

      <Separator className="my-8" />

      {isPrototype ? (
        <LocalComputeLab />
      ) : (
        <Card className="border border-dashed border-border/70 bg-secondary/40">
          <CardHeader>
            <CardTitle className="text-lg">Tool in roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>This route is already wired and can be upgraded to a full tool without changing the URL structure.</p>
            <p>{tool.privacyNote}</p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6 border border-border/80 bg-card/95">
        <CardHeader>
          <CardTitle className="text-base">Privacy-safe input handling defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. User input is sanitized before any computation.</p>
          <p>2. Calculations happen client-side and are not persisted by default.</p>
          <p>3. Tool routes are framework-ready for isolated feature upgrades.</p>
        </CardContent>
      </Card>
    </SectionContainer>
  );
}
