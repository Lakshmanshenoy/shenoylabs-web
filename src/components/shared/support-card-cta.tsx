import Link from "next/link";
import { HeartIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SupportCardCtaProps = {
  title: string;
  body: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  footnote?: string;
  className?: string;
};

function withDirectionalArrow(label: string, href: string): string {
  if (/[↗→]$/.test(label.trim())) return label;
  if (href.startsWith("/") || href.startsWith("#")) return `${label} →`;
  return `${label} ↗`;
}

export function SupportCardCta({
  title,
  body,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  footnote,
  className,
}: SupportCardCtaProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/5 px-8 py-12 text-center sm:py-14",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
        <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <HeartIcon className="size-6 text-red-500" />
        </span>

        <div className="space-y-3">
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">{body}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={primaryCtaHref}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 gap-2 px-7 shadow-sm shadow-primary/20 transition-shadow hover:shadow-md hover:shadow-primary/25",
            )}
          >
            {withDirectionalArrow(primaryCtaLabel, primaryCtaHref)}
            <HeartIcon className="size-4 text-red-500" />
          </Link>

          {secondaryCtaLabel && secondaryCtaHref ? (
            <Link
              href={secondaryCtaHref}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 px-7")}
            >
              {withDirectionalArrow(secondaryCtaLabel, secondaryCtaHref)}
            </Link>
          ) : null}
        </div>

        {footnote ? <p className="text-xs text-muted-foreground">{footnote}</p> : null}
      </div>
    </div>
  );
}
