import ToolCard from "../../components/ToolCard";

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-foreground">Tools</h1>
      <p className="mt-2 text-muted">A collection of usable tools and utilities.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ToolCard
          title="Scientific Caffeine Calculator"
          description="Flagship calculator (placeholder)"
          href="/tools/caffeine-calculator"
        />
        <ToolCard title="Unit Converter" description="Quick converters" href="/tools/unit-converter" />
      </div>
    </div>
  );
}
