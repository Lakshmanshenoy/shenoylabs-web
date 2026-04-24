import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "CaffiLab | Scientific Caffeine Calculator",
  description:
    "Estimate caffeine for an exact coffee brew using coffee grams, bean type, extraction efficiency, and dilution.",
  alternates: {
    canonical: "/caffilab",
  },
};

const CaffiLabCalculator = dynamic(
  () =>
    import("@/components/caffilab/caffilab-calculator").then(
      (mod) => mod.CaffiLabCalculator,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0c0d0b] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="inline-flex h-8 w-48 animate-pulse items-center gap-2 rounded-[6px] bg-[#1e2419]" />
          </div>
        </div>
      </div>
    ),
  },
);

export default function CaffiLabPage() {
  return <CaffiLabCalculator />;
}
