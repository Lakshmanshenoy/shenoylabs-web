"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-destructive" aria-hidden="true">
        !
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        An unexpected error occurred. Please try again or return to the
        homepage.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Go home
        </Link>
      </div>
    </section>
  );
}
