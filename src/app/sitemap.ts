import type { MetadataRoute } from "next";

import { getAllArticles, getAllProjects } from "@/lib/content";
import { siteConfig } from "@/lib/site";

// Static page last-modified dates. Update when you make meaningful changes
// to those pages. Using real dates (not `new Date()`) prevents crawlers from
// thinking every page changed on every deploy, which wastes crawl budget.
const STATIC_DATES = {
  home:           new Date("2026-04-28"),
  caffilab:       new Date("2026-04-28"),
  projects:       new Date("2026-04-28"),
  articles:       new Date("2026-04-28"),
  contact:        new Date("2026-04-28"),
  support:        new Date("2026-04-28"),
  privacyPolicy:  new Date("2026-04-28"),
  terms:          new Date("2026-04-28"),
  refundPolicy:   new Date("2026-04-28"),
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: STATIC_DATES.home, changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteConfig.url}/caffilab`,
      lastModified: STATIC_DATES.caffilab,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${siteConfig.url}/projects`,
      lastModified: STATIC_DATES.projects,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/articles`,
      lastModified: STATIC_DATES.articles,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/contact`,
      lastModified: STATIC_DATES.contact,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/support`,
      lastModified: STATIC_DATES.support,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteConfig.url}/privacy-policy`,
      lastModified: STATIC_DATES.privacyPolicy,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteConfig.url}/terms-of-service`,
      lastModified: STATIC_DATES.terms,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteConfig.url}/refund-policy`,
      lastModified: STATIC_DATES.refundPolicy,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  const articleRoutes: MetadataRoute.Sitemap = getAllArticles().map((item) => ({
    url: `${siteConfig.url}/articles/${item.slug}`,
    lastModified: new Date(
      item.frontmatter.lastUpdated ??
        item.frontmatter.createdDate ??
        item.frontmatter.date,
    ),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const projectRoutes: MetadataRoute.Sitemap = getAllProjects().map((item) => ({
    url: `${siteConfig.url}/projects/${item.slug}`,
    lastModified: new Date(item.frontmatter.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...articleRoutes, ...projectRoutes];
}
