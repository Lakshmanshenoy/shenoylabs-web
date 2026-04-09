import { MailIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterPlaceholder() {
  return (
    <section className="flex h-full rounded-xl border border-border/80 bg-secondary/35 p-5 sm:p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <MailIcon className="size-4" />
        </div>
        <div className="flex w-full flex-1 flex-col">
          <p className="text-sm font-medium">Join the newsletter</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Weekly notes, build logs, and useful links.
          </p>
          <form
            action="https://shenoylabs.beehiiv.com/subscribe"
            method="get"
            target="_blank"
            className="mt-4 flex flex-col gap-2 sm:mt-auto sm:flex-row sm:items-center sm:gap-8"
          >
            <Input
              type="email"
              name="email"
              required
              placeholder="you@company.com"
              className="h-10 w-full sm:flex-1 sm:min-w-0"
            />
            <Button
              type="submit"
              className="h-10 w-full sm:w-36 sm:flex-none sm:px-5"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
