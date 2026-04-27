/**
 * RSS 2.0 feed for all articles, available at /feed.xml.
 * Generated at request time (ISR-friendly — Next.js caches route handlers).
 *
 * Linked from the <head> via the root layout's metadata.alternates.
 */

import { getAllArticles } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = getAllArticles();

  const items = articles
    .map((article) => {
      const fm = article.frontmatter;
      const pubDate = new Date(
        fm.createdDate ?? fm.date,
      ).toUTCString();
      const link = `${siteConfig.url}/articles/${article.slug}`;
      const ogImage = `${siteConfig.url}/api/og?title=${encodeURIComponent(fm.title)}&type=article`;

      return `  <item>
    <title>${escapeXml(fm.title)}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <description>${escapeXml(fm.excerpt)}</description>
    <pubDate>${pubDate}</pubDate>
    <author>${escapeXml(siteConfig.author)}</author>
    ${fm.tags.map((t) => `<category>${escapeXml(t)}</category>`).join("\n    ")}
    <enclosure url="${ogImage}" type="image/png" length="0" />
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en-us</language>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
