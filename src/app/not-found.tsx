import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-primary" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Try heading back to the homepage.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className={buttonVariants()}>Go home</Link>
        <Link href="/contact" className={buttonVariants({ variant: "outline" })}>
          Contact us
        </Link>
      </div>
    </section>
  );
}
