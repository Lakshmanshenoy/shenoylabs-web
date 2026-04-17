import type { Metadata } from "next";

import { CaffiLabCalculator } from "@/components/caffilab/caffilab-calculator";

export const metadata: Metadata = {
  title: "CaffiLab | Scientific Caffeine Calculator",
  description:
    "Estimate caffeine for an exact coffee brew using coffee grams, bean type, extraction efficiency, and dilution.",
  alternates: {
    canonical: "/caffilab",
  },
};

export default function CaffiLabPage() {
  return <CaffiLabCalculator />;
}
