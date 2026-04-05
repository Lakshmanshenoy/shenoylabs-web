import Link from "next/link";

export default function ColdBrewArticlePlaceholder() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">How much caffeine is in cold brew?</h1>
      <p className="mt-4 text-muted">
        Placeholder summary: this article will explain measured caffeine
        concentrations in cold brew, methods, and how to interpret results.
      </p>

      <div className="mt-6">
        <Link href="/support" className="text-primary">
          Support Shenoy Labs
        </Link>
      </div>
    </div>
  );
}
