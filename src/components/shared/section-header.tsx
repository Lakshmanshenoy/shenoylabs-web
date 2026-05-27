import React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  badge?: string;
  title: string;
  description?: React.ReactNode;
  className?: string;
};

export function SectionHeader({
  badge,
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {badge ? <Badge variant="outline" className="text-[10px] tracking-[0.16em] uppercase">{badge}</Badge> : null}
      <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
