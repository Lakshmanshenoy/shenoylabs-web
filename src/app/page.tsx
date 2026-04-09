import type { Metadata } from "next";

import { AboutSnapshotSection } from "@/components/home/about-snapshot-section";
import { ArticlesPreviewSection } from "@/components/home/articles-preview-section";
import { FeaturedProjectsSection } from "@/components/home/featured-projects-section";
import { HeroSection } from "@/components/home/hero-section";
import { SupportCtaSection } from "@/components/home/support-cta-section";
import { TaxonomyDiscoveryStrip } from "@/components/home/taxonomy-discovery-strip";
import {
  getHeroContent,
  getFeaturedProjectsContent,
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
  const supportCopy = getSupportCopyContent();

  return (
    <>
      <HeroSection content={hero} />
      <FeaturedProjectsSection content={featuredProjects} />
      <ArticlesPreviewSection />
      <AboutSnapshotSection />
      <TaxonomyDiscoveryStrip />
      <SupportCtaSection content={supportCopy} />
    </>
  );
}
