import type { Metadata } from "next";

import { AboutSnapshotSection } from "@/components/home/about-snapshot-section";
import { ArticlesPreviewSection } from "@/components/home/articles-preview-section";
import { CurrentlyBuildingSection } from "@/components/home/currently-building-section";
import { FeaturedProjectsSection } from "@/components/home/featured-projects-section";
import { HeroSection } from "@/components/home/hero-section";
import { SupportCtaSection } from "@/components/home/support-cta-section";
import { ToolsRoadmapSection } from "@/components/home/tools-roadmap-section";
import {
  getHeroContent,
  getFeaturedProjectsContent,
  getCurrentlyExploringContent,
  getSupportCopyContent,
} from "@/lib/homepage-content";

export const metadata: Metadata = {
  title: "Shenoy Labs",
  description: "Premium hybrid product studio by Lakshman Shenoy.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const hero = getHeroContent();
  const featuredProjects = getFeaturedProjectsContent();
  const currentlyExploring = getCurrentlyExploringContent();
  const supportCopy = getSupportCopyContent();

  return (
    <>
      <HeroSection content={hero} />
      <FeaturedProjectsSection content={featuredProjects} />
      <CurrentlyBuildingSection content={currentlyExploring} />
      <ArticlesPreviewSection />
      <AboutSnapshotSection />
      <ToolsRoadmapSection />
      <SupportCtaSection content={supportCopy} />
    </>
  );
}
