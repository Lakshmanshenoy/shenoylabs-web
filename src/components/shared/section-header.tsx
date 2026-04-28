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
    <div className={cn("space-y-3", className)}>
      {badge ? <Badge variant="outline">{badge}</Badge> : null}
      <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
