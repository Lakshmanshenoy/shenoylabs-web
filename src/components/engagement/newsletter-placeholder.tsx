import { MailIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterPlaceholder() {
  return (
    <section className="flex h-full rounded-2xl border border-border/80 bg-card/95 p-6">
      <div className="flex w-full items-start gap-4">
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <MailIcon className="size-4" />
        </div>
        <div className="flex w-full flex-1 flex-col">
          <p className="text-base font-semibold text-foreground">Newsletter</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Occasional notes on projects, research, and useful links.
          </p>
          <form
            action="https://shenoylabs.beehiiv.com/subscribe"
            method="get"
            target="_blank"
            className="mt-5 flex flex-col gap-3"
          >
            <Input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="h-11 w-full"
            />
            <Button type="submit" className="h-11 w-full">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
