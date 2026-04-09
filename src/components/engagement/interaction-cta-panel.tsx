import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function InteractionCtaPanel() {
  return (
    <section className="flex h-full rounded-2xl border border-border/80 bg-secondary/30 p-6">
      <div className="flex flex-1 flex-col">
        <p className="text-base font-semibold text-foreground">Get in touch</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Send a note, suggest a topic, or support the work.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 sm:mt-auto">
          <Link href="/contact" className={buttonVariants({ size: "sm" })}>
            Send a note
          </Link>
          <Link
            href="/support"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Support
          </Link>
        </div>
        <div className="mt-3">
          <Link
            href="/contact"
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Suggest a topic
          </Link>
        </div>
      </div>
    </section>
  );
}
