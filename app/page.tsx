import Link from 'next/link';
import ToolCard from '../components/ToolCard';
import { Button } from '../components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20 lg:py-28">
          <header className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">Shenoy Labs</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base sm:text-lg md:text-xl text-muted leading-relaxed">
            Thoughtful tools, calculators, and projects built in public.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link href="/tools" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Try tools</Button>
            </Link>
            <Link href="/projects" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">Projects</Button>
            </Link>
          </div>
        </header>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-foreground">Featured Tools</h2>
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
          <h2 className="text-2xl font-semibold text-foreground">Projects</h2>
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
          <h2 className="text-2xl font-semibold text-foreground">Latest Articles</h2>
          <ul className="mt-4 space-y-3">
            <li>
              <Link
                href="/articles/how-much-caffeine-in-cold-brew"
                className="text-primary hover:underline"
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
