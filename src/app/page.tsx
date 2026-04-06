import type { Metadata } from "next";

import { ArticlesPreviewSection } from "@/components/home/articles-preview-section";
import { CurrentlyBuildingSection } from "@/components/home/currently-building-section";
import { FeaturedProjectsSection } from "@/components/home/featured-projects-section";
import { HeroSection } from "@/components/home/hero-section";
import { SupportCtaSection } from "@/components/home/support-cta-section";
import { ToolsRoadmapSection } from "@/components/home/tools-roadmap-section";

export const metadata: Metadata = {
  title: "Shenoy Labs",
  description: "Premium hybrid product studio by Lakshman Shenoy.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProjectsSection />
      <ToolsRoadmapSection />
      <ArticlesPreviewSection />
      <CurrentlyBuildingSection />
      <SupportCtaSection />
    </>
  );
}
