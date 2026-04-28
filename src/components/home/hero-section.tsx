import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroContent } from "@/lib/homepage-content";

type Props = { content: HeroContent };

export function HeroSection({ content }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* Ambient background blobs — slow drift brings the hero alive */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="blob-drift absolute -left-24 -top-24 h-[480px] w-[480px] rounded-full bg-primary/10 blur-3xl" />
        <div className="blob-drift-2 absolute -right-24 top-32 h-[360px] w-[360px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:gap-16">
          {/* Left: headline + CTAs — staggered reveal cascade */}
          <div className="reveal-group flex-1 space-y-7">
            <Badge
              variant="outline"
              className="gap-1.5 border-primary/30 bg-primary/5 text-primary"
            >
              <SparklesIcon className="size-3" />
              Hybrid Product Studio
            </Badge>

            <h1 className="font-heading max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              {content.headline}
            </h1>

            <p className="font-heading text-xl font-semibold tracking-tight text-foreground/90 sm:text-2xl">
              {content.identityLine.replace("Learner", "\x00").split("\x00").map((part, i) =>
                i === 0
                  ? <span key={i}>{part}<span className="text-blue-500">Learner</span></span>
                  : <span key={i}>{part}</span>
              )}
            </p>

            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              {content.subheadline}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={content.primaryCta.href}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 gap-2 px-7 shadow-sm shadow-primary/20 transition-shadow hover:shadow-md hover:shadow-primary/25",
                )}
              >
                {content.primaryCta.label}
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link
                href={content.secondaryCta.href}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 px-7",
                )}
              >
                {content.secondaryCta.label}
              </Link>
            </div>

            {/* Social proof strip */}
            {content.statusLine || content.tagline ? (
              <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
                {content.statusLine ? (
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block size-2 rounded-full bg-emerald-400" />
                    {content.statusLine}
                  </span>
                ) : null}
                {content.statusLine && content.tagline ? (
                  <span className="hidden sm:block">·</span>
                ) : null}
                {content.tagline ? <span>{content.tagline}</span> : null}
              </div>
            ) : null}
          </div>

          {/* Right: premium visual + floating cards — delayed entry */}
          <div className="reveal-delayed w-full max-w-sm shrink-0 lg:w-96">
            <div className="soft-lift relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl"
              />
              {content.visualImage && (
                <div className="mb-4 overflow-hidden rounded-xl border border-border/70">
                  <Image
                    src={content.visualImage}
                    alt={content.visualAlt ?? "Hero preview visual"}
                    width={1200}
                    height={800}
                    className="h-auto w-full"
                    priority
                    sizes="(max-width: 1024px) 100vw, 384px"
                  />
                </div>
              )}
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                What I do
              </p>
              <ul className="mt-4 space-y-3">
                {content.whatIDo.map(({ icon, label }) => (
                  <li key={label} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 text-base leading-none">{icon}</span>
                    <span className="text-foreground/80">{label}</span>
                  </li>
                ))}
              </ul>
              {content.credentialFootnote ? (
                <div className="mt-5 border-t border-border/60 pt-5">
                  <p className="text-xs text-muted-foreground">
                    {content.credentialFootnote}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
