import Link from 'next/link';

export default function CaffeineCalculatorPlaceholder() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Scientific Caffeine Calculator</h1>
      <p className="mt-4 text-muted">
        This is a placeholder for the flagship calculator. The calculation engine will be
        implemented in a later step — for now you can view the project notes and supporting article.
      </p>

      <div className="mt-6 flex gap-4">
        <Link href="/projects/scientific-caffeine-calculator" className="text-indigo-300">
          Project writeup
        </Link>
        <Link href="/articles/how-much-caffeine-in-cold-brew" className="text-indigo-300">
          Related article
        </Link>
      </div>
    </div>
  );
}
