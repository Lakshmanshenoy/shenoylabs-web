import { ArrowRightIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CtaBlockProps = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

export function CtaBlock({
  title,
  description,
  ctaLabel,
  ctaHref,
}: CtaBlockProps) {
  return (
    <Card className="soft-lift border border-border/90 bg-card/95">
      <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-heading text-xl font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>

        <a
          href={ctaHref}
          className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}
        >
          {ctaLabel}
          <ArrowRightIcon className="size-4" />
        </a>
      </CardContent>
    </Card>
  );
}
