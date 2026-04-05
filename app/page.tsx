import Link from 'next/link';
import ToolCard from '../components/ToolCard';
import { Button } from '../components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <header className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900">Shenoy Labs</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
            Thoughtful tools, calculators, and projects built in public.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/tools" legacyBehavior>
              <Button>Try tools</Button>
            </Link>
            <Link href="/projects" legacyBehavior>
              <Button variant="outline">Projects</Button>
            </Link>
          </div>
        </header>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900">Featured Tools</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolCard
              title="Scientific Caffeine Calculator"
              description="Flagship calculator (placeholder)"
              href="/tools/caffeine-calculator"
            />
            <ToolCard
              title="Unit Converter"
              description="Small utilities for quick conversions"
              href="/tools/unit-converter"
            />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">Projects</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolCard
              title="Scientific Caffeine Calculator (Project)"
              description="Why we built it and early learnings"
              href="/projects/scientific-caffeine-calculator"
            />
            <ToolCard
              title="Sample Project"
              description="Project writeup placeholder"
              href="/projects/sample-project"
            />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">Latest Articles</h2>
          <ul className="mt-4 space-y-3">
            <li>
              <Link
                href="/articles/how-much-caffeine-in-cold-brew"
                className="text-indigo-600 hover:underline"
              >
                How much caffeine is in cold brew?
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
