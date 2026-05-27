import { getAllArticles } from "@/lib/content";

function overlapScore(a: string[], b: string[]): number {
  const set = new Set(a.map((value) => value.toLowerCase()));
  return b.reduce(
    (score, value) => score + (set.has(value.toLowerCase()) ? 1 : 0),
    0,
  );
}

export function getCanonInvestigations(limit = 3) {
  const investigations = getAllArticles();

  return investigations
    .map((investigation) => {
      const inboundLinks = investigations.filter((candidate) =>
        [...candidate.frontmatter.related_investigations, ...candidate.frontmatter.temporal_callbacks]
          .includes(investigation.slug),
      ).length;

      const continuityScore = investigations
        .filter((candidate) => candidate.slug !== investigation.slug)
        .reduce(
          (score, candidate) =>
            score +
            overlapScore(investigation.frontmatter.concepts, candidate.frontmatter.concepts) +
            overlapScore(investigation.frontmatter.pathways, candidate.frontmatter.pathways),
          0,
        );

      const editorialWeight = investigation.frontmatter.canon_weight ?? 0;
      const canonicalBoost = investigation.frontmatter.canonical_text ? 6 : 0;

      return {
        investigation,
        score: inboundLinks * 3 + continuityScore + editorialWeight + canonicalBoost,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.investigation);
}

export function getTemporalContinuity(slug: string) {
  const investigations = getAllArticles();
  const current = investigations.find((item) => item.slug === slug);

  if (!current) {
    return {
      earlier: [],
      later: [],
      recurringThemes: [],
    };
  }

  const createdAt = new Date(
    current.frontmatter.published_at ?? current.frontmatter.date,
  ).getTime();

  const relatedPool = investigations.filter((item) => item.slug !== slug);

  const earlier = relatedPool
    .filter((item) => {
      const itemDate = new Date(item.frontmatter.published_at ?? item.frontmatter.date).getTime();
      return itemDate <= createdAt;
    })
    .filter((item) =>
      overlapScore(current.frontmatter.concepts, item.frontmatter.concepts) > 0 ||
      current.frontmatter.temporal_callbacks.includes(item.slug) ||
      item.frontmatter.related_investigations.includes(slug),
    )
    .slice(0, 3);

  const later = relatedPool
    .filter((item) => {
      const itemDate = new Date(item.frontmatter.published_at ?? item.frontmatter.date).getTime();
      return itemDate > createdAt;
    })
    .filter((item) =>
      overlapScore(current.frontmatter.concepts, item.frontmatter.concepts) > 0 ||
      current.frontmatter.related_investigations.includes(item.slug),
    )
    .slice(0, 3);

  const recurringThemes = Array.from(
    new Set([
      ...current.frontmatter.concepts,
      ...current.frontmatter.pathways,
      ...current.frontmatter.research_worlds,
    ]),
  ).slice(0, 8);

  return {
    earlier,
    later,
    recurringThemes,
  };
}
