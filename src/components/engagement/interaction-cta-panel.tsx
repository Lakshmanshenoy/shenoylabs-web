import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function InteractionCtaPanel() {
  return (
    <section className="rounded-xl border border-border/80 bg-card/95 p-5">
      <p className="text-sm font-medium">Keep the ideas moving</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Suggest a topic, request a tool, share feedback, or support the project.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/contact" className={buttonVariants({ size: "sm" })}>
          Suggest a topic
        </Link>
        <Link
          href="/tools"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Request a tool
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
          Support the project
        </Link>
      </div>
    </section>
  );
}
