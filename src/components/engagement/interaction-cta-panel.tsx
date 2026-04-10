import Link from "next/link";

import { cn } from "@/lib/utils";

export function InteractionCtaPanel() {
  return (
    <section className="overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-secondary/40 via-card to-secondary/20 p-6 shadow-sm sm:p-7">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Get in touch
          </p>
          <div className="space-y-1.5">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              Start a conversation
            </h2>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Reach out with a question, a project idea, or a topic you want explored next.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/contact"
            className="group rounded-2xl border border-primary/20 bg-primary px-4 py-4 text-primary-foreground transition-colors hover:bg-primary/92"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Send a note</p>
                <p className="mt-1 text-sm text-primary-foreground/80">
                  Ask about product, engineering, or advisory work.
                </p>
              </div>
              <span className="text-lg transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </Link>

          <Link
            href="/support"
            className="group rounded-2xl border border-border/80 bg-background/70 px-4 py-4 transition-colors hover:border-primary/25 hover:bg-background"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Support the work</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Contribute if the writing or projects have been useful.
                </p>
              </div>
              <span className="text-lg text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground">
                →
              </span>
            </div>
          </Link>

          <Link
            href="/contact"
            className={cn(
              "group rounded-2xl border border-dashed border-border/80 bg-background/40 px-4 py-4 transition-colors hover:border-primary/25 hover:bg-background/70 sm:col-span-2",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Suggest a topic</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Share a question, edge case, or theme you want covered in future posts.
                </p>
              </div>
              <span className="text-lg text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground">
                →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
