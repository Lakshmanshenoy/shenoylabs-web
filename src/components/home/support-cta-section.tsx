import { HeartIcon } from "lucide-react";

import { SectionContainer } from "@/components/shared/section-container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SupportCopyContent } from "@/lib/homepage-content";

type Props = { content: SupportCopyContent };

export function SupportCtaSection({ content }: Props) {
  return (
    <SectionContainer className="bg-secondary/50">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/5 px-8 py-12 text-center sm:py-16">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/15 blur-3xl" />
        </div>

        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
          <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HeartIcon className="size-6 text-red-500" />
          </span>

          <div className="space-y-3">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {content.heading}
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              {content.body}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/support"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 gap-2 px-7 shadow-sm shadow-primary/20 transition-shadow hover:shadow-md hover:shadow-primary/25",
              )}
            >
              Support the work
              <HeartIcon className="size-4 text-red-500" />
            </a>
            <a
              href="/about"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 px-7",
              )}
            >
              Learn more about me
            </a>
          </div>

          <p className="text-xs text-muted-foreground">{content.footnote}</p>
        </div>
      </div>
    </SectionContainer>
  );
}
