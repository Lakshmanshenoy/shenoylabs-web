import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function InteractionCtaPanel() {
  return (
    <section className="flex h-full rounded-xl border border-border/80 bg-card/95 p-5 sm:p-4">
      <div className="flex flex-1 flex-col">
      <p className="text-sm font-medium">Keep it moving</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Send a topic idea, quick note, or support the work.
      </p>
      <div className="mt-4 flex flex-wrap gap-2 sm:mt-auto">
        <Link href="/contact" className={buttonVariants({ size: "sm" })}>
          Suggest a topic
        </Link>
        <Link
          href="/contact"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Send feedback
        </Link>
        <Link
          href="/support"
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
        >
          Support
        </Link>
      </div>
      </div>
    </section>
  );
}
