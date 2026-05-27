import type { Metadata } from "next";

import { ProjectsFilteredGrid } from "@/components/projects/projects-filtered-grid";
import { SectionContainer } from "@/components/shared/section-container";
import { getAllProjects } from "@/lib/content";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Projects — Shenoy Labs",
  description:
    "Shipped products, ongoing builds, and planned work by Lakshman Shenoy.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Projects — Shenoy Labs",
    description:
      "Shipped products, ongoing builds, and planned work by Lakshman Shenoy.",
    type: "website",
    url: "/projects",
    images: ["/api/og?title=Projects"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects — Shenoy Labs",
    description:
      "Shipped products, ongoing builds, and planned work by Lakshman Shenoy.",
    images: ["/api/og?title=Projects"],
  },
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
  ]);

  return (
    <SectionContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <ProjectsFilteredGrid projects={projects} />
    </SectionContainer>
  );
}
