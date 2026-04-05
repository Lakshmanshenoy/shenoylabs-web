import Link from "next/link";

export default function ProjectScientificCaffeine() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Scientific Caffeine Calculator — Project</h1>
      <p className="mt-4 text-zinc-600">
        Project writeup: problem statement, motivation, stack, and roadmap. This
        is a placeholder page that will be expanded with screenshots and
        technical notes.
      </p>

      <div className="mt-6">
        <Link href="/tools/caffeine-calculator" className="text-indigo-600">
          Open tool (placeholder)
        </Link>
      </div>
    </div>
  );
}
