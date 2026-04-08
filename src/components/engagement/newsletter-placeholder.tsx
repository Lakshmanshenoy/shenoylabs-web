import { MailIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function NewsletterPlaceholder() {
  return (
    <section className="rounded-xl border border-dashed border-border/80 bg-secondary/40 p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <MailIcon className="size-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Newsletter (Coming soon)</p>
            <Badge variant="outline" className="text-[10px]">
              Placeholder
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            A future update loop for curated research notes, tool drops, and weekly insights.
          </p>
        </div>
      </div>
    </section>
  );
}
