import type { Metadata } from "next";

import { AboutSnapshotSection } from "@/components/home/about-snapshot-section";
import { ArticlesPreviewSection } from "@/components/home/articles-preview-section";
import { FeaturedProjectsSection } from "@/components/home/featured-projects-section";
import { FeaturedToolsSection } from "@/components/home/featured-tools-section";
import { HeroSection } from "@/components/home/hero-section";
import { SupportCtaSection } from "@/components/home/support-cta-section";
import { TaxonomyDiscoveryStrip } from "@/components/home/taxonomy-discovery-strip";
import {
  getHeroContent,
  getFeaturedProjectsContent,
  getSupportCopyContent,
} from "@/lib/homepage-content";

export const metadata: Metadata = {
  title: "Home — Shenoy Labs",
  description: "Research, tools, and projects built in public by Lakshman Shenoy.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const hero = getHeroContent();
  const featuredProjects = getFeaturedProjectsContent();
  const supportCopy = getSupportCopyContent();

  return (
    <>
      <HeroSection content={hero} />
      <FeaturedToolsSection />
      <FeaturedProjectsSection content={featuredProjects} />
      <ArticlesPreviewSection />
      <AboutSnapshotSection />
      <TaxonomyDiscoveryStrip />
      <SupportCtaSection content={supportCopy} />
    </>
  );
}
