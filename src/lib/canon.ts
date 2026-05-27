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

export function getCanonResurfacing(limit = 4) {
  const canon = getCanonInvestigations(Math.max(limit * 2, 6));
  const investigations = getAllArticles();

  return canon
    .map((investigation) => {
      const inboundReferences = investigations.filter((candidate) =>
        [
          ...candidate.frontmatter.related_investigations,
          ...candidate.frontmatter.temporal_callbacks,
        ].includes(investigation.slug),
      ).length;

      const recurringConcepts = Array.from(
        new Set(investigation.frontmatter.concepts),
      ).slice(0, 3);

      return {
        investigation,
        inboundReferences,
        recurringConcepts,
      };
    })
    .sort((a, b) => b.inboundReferences - a.inboundReferences)
    .slice(0, limit);
}

export function getHistoricalThreads(limit = 4) {
  const investigations = getAllArticles();
  const threadMap = new Map<
    string,
    {
      label: string;
      investigations: string[];
      firstSeen: string;
      lastSeen: string;
    }
  >();

  for (const investigation of investigations) {
    const date = investigation.frontmatter.published_at ?? investigation.frontmatter.date;
    for (const concept of investigation.frontmatter.concepts) {
      const key = concept.toLowerCase();
      const existing = threadMap.get(key);

      if (!existing) {
        threadMap.set(key, {
          label: concept,
          investigations: [investigation.slug],
          firstSeen: date,
          lastSeen: date,
        });
        continue;
      }

      existing.investigations.push(investigation.slug);
      if (new Date(date).getTime() < new Date(existing.firstSeen).getTime()) {
        existing.firstSeen = date;
      }
      if (new Date(date).getTime() > new Date(existing.lastSeen).getTime()) {
        existing.lastSeen = date;
      }
    }
  }

  return Array.from(threadMap.values())
    .filter((thread) => new Set(thread.investigations).size > 1)
    .sort(
      (a, b) =>
        new Set(b.investigations).size - new Set(a.investigations).size,
    )
    .slice(0, limit)
    .map((thread) => ({
      ...thread,
      investigations: Array.from(new Set(thread.investigations)),
    }));
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
