export type ToolStatus = "coming-soon" | "prototype";

export type ToolRoadmapItem = {
  slug: string;
  title: string;
  description: string;
  category: "Finance" | "Productivity" | "Writing" | "Operations";
  eta: string;
  status: ToolStatus;
  privacyNote: string;
  previewImage: string;
  previewAlt: string;
};

export const toolsRegistry: ToolRoadmapItem[] = [
  {
    slug: "loan-emi-calculator",
    title: "Loan EMI Calculator",
    description:
      "Compute monthly installments, total interest, and payment structure with local-only calculations.",
    category: "Finance",
    eta: "Q2 2026",
    status: "coming-soon",
    privacyNote: "Inputs stay in your browser and are never stored server-side.",
    previewImage: "/images/tools/loan-emi-calculator.svg",
    previewAlt: "Loan EMI calculator preview graphic",
  },
  {
    slug: "sip-returns-planner",
    title: "SIP Returns Planner",
    description:
      "Plan investment growth with configurable assumptions, inflation controls, and scenario comparisons.",
    category: "Finance",
    eta: "Q2 2026",
    status: "coming-soon",
    privacyNote: "No personal financial data is persisted.",
    previewImage: "/images/tools/sip-returns-planner.svg",
    previewAlt: "SIP returns planner preview graphic",
  },
  {
    slug: "resume-scorer",
    title: "Resume Scorer",
    description:
      "Match resume content against role requirements and generate actionable quality signals in-browser.",
    category: "Productivity",
    eta: "Q3 2026",
    status: "coming-soon",
    privacyNote: "Text analysis is processed client-side for privacy by design.",
    previewImage: "/images/tools/resume-scorer.svg",
    previewAlt: "Resume scorer preview graphic",
  },
  {
    slug: "readability-analyzer",
    title: "Readability Analyzer",
    description:
      "Measure reading complexity and writing clarity to improve communication quality quickly.",
    category: "Writing",
    eta: "Q3 2026",
    status: "coming-soon",
    privacyNote: "Draft text remains in the browser session only.",
    previewImage: "/images/tools/readability-analyzer.svg",
    previewAlt: "Readability analyzer preview graphic",
  },
  {
    slug: "local-compute-lab",
    title: "Local Compute Lab",
    description:
      "Framework preview route demonstrating sanitized, client-only calculations for future tools.",
    category: "Operations",
    eta: "Now",
    status: "prototype",
    privacyNote: "Computation runs locally and clears on refresh.",
    previewImage: "/images/tools/local-compute-lab.svg",
    previewAlt: "Local compute lab preview graphic",
  },
];

export function getAllTools() {
  return toolsRegistry;
}

export function getToolBySlug(slug: string) {
  return toolsRegistry.find((tool) => tool.slug === slug) ?? null;
}
