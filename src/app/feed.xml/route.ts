/**
 * RSS 2.0 feed for all articles, available at /feed.xml.
 * Generated at request time (ISR-friendly — Next.js caches route handlers).
 *
 * Linked from the <head> via the root layout's metadata.alternates.
 */

import { getAllArticles } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(str: unknown): string {
  const s = str == null ? "" : String(str);
  return s
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
      const fm = article.frontmatter ?? {};

      const rawDate = fm.createdDate ?? fm.date;
      const dateObj = rawDate ? new Date(rawDate) : new Date();
      const pubDate = isNaN(dateObj.getTime())
        ? new Date().toUTCString()
        : dateObj.toUTCString();

      const link = `${siteConfig.url}/articles/${article.slug}`;

      const title = fm.title ?? article.slug ?? siteConfig.name;
      const ogImage = `${siteConfig.url}/api/og?title=${encodeURIComponent(
        String(title),
      )}&type=article`;

      const description = fm.excerpt ?? "";

      const tags = Array.isArray(fm.tags) ? fm.tags : [];
      const tagsXml = tags.length
        ? "\n    " + tags.map((t) => `<category>${escapeXml(t)}</category>`).join("\n    ")
        : "";

      return `  <item>
    <title>${escapeXml(title)}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <description>${escapeXml(description)}</description>
    <pubDate>${pubDate}</pubDate>
    <author>${escapeXml(siteConfig.author ?? "")}</author>${tagsXml}
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
