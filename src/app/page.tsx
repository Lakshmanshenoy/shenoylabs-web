import type { Metadata } from "next";

import { InquiryPortal } from "@/components/home/inquiry-portal";

export const metadata: Metadata = {
  title: "Home — Shenoy Labs",
  description:
    "An inquiry-driven publishing environment for investigations, research worlds, pathways, and technical artifacts.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <InquiryPortal />;
}
