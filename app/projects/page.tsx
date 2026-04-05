import ToolCard from "../../components/ToolCard";

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-zinc-900">Projects</h1>
      <p className="mt-2 text-zinc-600">Project case studies and learnings.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ToolCard
          title="Scientific Caffeine Calculator"
          description="Research, implementation notes, and roadmap"
          href="/projects/scientific-caffeine-calculator"
        />
        <ToolCard title="Sample Project" description="Placeholder project" href="/projects/sample-project" />
      </div>
    </div>
  );
}
