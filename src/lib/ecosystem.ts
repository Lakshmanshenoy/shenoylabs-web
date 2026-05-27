import {
  getAllArticles,
  getAllProjects,
  type ArticleFrontmatter,
} from "@/lib/content";

type Investigation = ReturnType<typeof getAllArticles>[number];
type Project = ReturnType<typeof getAllProjects>[number];

export type ConceptProfile = {
  slug: string;
  label: string;
  investigations: string[];
  projects: string[];
  worlds: string[];
  pathways: string[];
  adjacentConcepts: string[];
};

export type WorldProfile = {
  slug: string;
  label: string;
  investigations: string[];
  concepts: string[];
  pathways: string[];
  adjacentWorlds: string[];
  unresolvedQuestions: string[];
};

export type PathwayProfile = {
  slug: string;
  label: string;
  investigations: string[];
  concepts: string[];
  depthStages: string[];
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function toTitleCase(value: string): string {
  return value
    .split(/[-\s]/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function collectQuestions(source: string): string[] {
  const stripped = source.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const matches = stripped.match(/[^\n]{18,120}\?/g) ?? [];
  return unique(
    matches
      .map((question) => question.trim())
      .filter((question) => /[a-z]/i.test(question)),
  ).slice(0, 4);
}

function byFrontmatterDate(a: Investigation, b: Investigation): number {
  const aDate = a.frontmatter.published_at ?? a.frontmatter.date;
  const bDate = b.frontmatter.published_at ?? b.frontmatter.date;
  return new Date(aDate).getTime() - new Date(bDate).getTime();
}

function stageLabel(frontmatter: ArticleFrontmatter): string {
  const mode = frontmatter.depth_mode?.toLowerCase();
  if (mode?.includes("practical")) return "Applied";
  if (mode?.includes("technical")) return "System";
  if (mode?.includes("research")) return "Research";
  return "Inquiry";
}

export function getConceptProfiles(): ConceptProfile[] {
  const investigations = getAllArticles();
  const projects = getAllProjects();
  const profiles = new Map<string, ConceptProfile>();

  const projectConcepts = new Map<string, string[]>();
  for (const project of projects) {
    projectConcepts.set(
      project.slug,
      project.frontmatter.tags.map((tag) => slugify(tag)).filter(Boolean),
    );
  }

  for (const investigation of investigations) {
    const investigationConcepts = unique(
      investigation.frontmatter.concepts.map((concept) => slugify(concept)),
    );

    for (const conceptSlug of investigationConcepts) {
      const profile = profiles.get(conceptSlug) ?? {
        slug: conceptSlug,
        label: toTitleCase(conceptSlug),
        investigations: [],
        projects: [],
        worlds: [],
        pathways: [],
        adjacentConcepts: [],
      };

      profile.investigations = unique([...profile.investigations, investigation.slug]);
      profile.worlds = unique([...profile.worlds, ...investigation.frontmatter.research_worlds]);
      profile.pathways = unique([...profile.pathways, ...investigation.frontmatter.pathways]);
      profile.adjacentConcepts = unique([
        ...profile.adjacentConcepts,
        ...investigationConcepts.filter((candidate) => candidate !== conceptSlug),
      ]);

      for (const project of projects) {
        const tags = projectConcepts.get(project.slug) ?? [];
        if (tags.includes(conceptSlug)) {
          profile.projects = unique([...profile.projects, project.slug]);
        }
      }

      profiles.set(conceptSlug, profile);
    }
  }

  return Array.from(profiles.values()).sort((a, b) => {
    if (b.investigations.length !== a.investigations.length) {
      return b.investigations.length - a.investigations.length;
    }
    return a.label.localeCompare(b.label);
  });
}

export function getConceptProfileBySlug(slug: string): ConceptProfile | undefined {
  return getConceptProfiles().find((profile) => profile.slug === slugify(slug));
}

export function getWorldProfiles(): WorldProfile[] {
  const investigations = getAllArticles();
  const worldMap = new Map<string, WorldProfile>();

  for (const investigation of investigations) {
    const worlds = investigation.frontmatter.research_worlds;
    for (const world of worlds) {
      const worldSlug = slugify(world);
      const profile = worldMap.get(worldSlug) ?? {
        slug: worldSlug,
        label: world,
        investigations: [],
        concepts: [],
        pathways: [],
        adjacentWorlds: [],
        unresolvedQuestions: [],
      };

      profile.investigations = unique([...profile.investigations, investigation.slug]);
      profile.concepts = unique([...profile.concepts, ...investigation.frontmatter.concepts]);
      profile.pathways = unique([...profile.pathways, ...investigation.frontmatter.pathways]);
      profile.adjacentWorlds = unique([
        ...profile.adjacentWorlds,
        ...worlds.filter((candidate) => candidate !== world),
      ]);
      profile.unresolvedQuestions = unique([
        ...profile.unresolvedQuestions,
        ...collectQuestions(investigation.source),
      ]).slice(0, 4);

      worldMap.set(worldSlug, profile);
    }
  }

  return Array.from(worldMap.values()).sort((a, b) => {
    if (b.investigations.length !== a.investigations.length) {
      return b.investigations.length - a.investigations.length;
    }
    return a.label.localeCompare(b.label);
  });
}

export function getWorldProfileBySlug(slug: string): WorldProfile | undefined {
  return getWorldProfiles().find((profile) => profile.slug === slugify(slug));
}

export function getPathwayProfiles(): PathwayProfile[] {
  const investigations = [...getAllArticles()].sort(byFrontmatterDate);
  const pathwayMap = new Map<string, PathwayProfile>();

  for (const investigation of investigations) {
    for (const pathway of investigation.frontmatter.pathways) {
      const pathwaySlug = slugify(pathway);
      const profile = pathwayMap.get(pathwaySlug) ?? {
        slug: pathwaySlug,
        label: pathway,
        investigations: [],
        concepts: [],
        depthStages: [],
      };

      profile.investigations = unique([...profile.investigations, investigation.slug]);
      profile.concepts = unique([...profile.concepts, ...investigation.frontmatter.concepts]);
      profile.depthStages = unique([...profile.depthStages, stageLabel(investigation.frontmatter)]);

      pathwayMap.set(pathwaySlug, profile);
    }
  }

  return Array.from(pathwayMap.values()).sort((a, b) => {
    if (b.investigations.length !== a.investigations.length) {
      return b.investigations.length - a.investigations.length;
    }
    return a.label.localeCompare(b.label);
  });
}

export function getPathwayProfileBySlug(slug: string): PathwayProfile | undefined {
  return getPathwayProfiles().find((profile) => profile.slug === slugify(slug));
}

export function getInvestigationContinuity(slug: string) {
  const article = getAllArticles().find((item) => item.slug === slug);
  if (!article) {
    return {
      concepts: [] as ConceptProfile[],
      adjacentWorlds: [] as WorldProfile[],
      pathways: [] as PathwayProfile[],
    };
  }

  const concepts = article.frontmatter.concepts
    .map((concept) => getConceptProfileBySlug(concept))
    .filter((concept): concept is ConceptProfile => Boolean(concept));

  const adjacentWorlds = article.frontmatter.research_worlds
    .map((world) => getWorldProfileBySlug(world))
    .filter((world): world is WorldProfile => Boolean(world));

  const pathways = article.frontmatter.pathways
    .map((pathway) => getPathwayProfileBySlug(pathway))
    .filter((pathway): pathway is PathwayProfile => Boolean(pathway));

  return {
    concepts,
    adjacentWorlds,
    pathways,
  };
}

export function getEcosystemSnapshot() {
  const investigations = getAllArticles();
  const projects = getAllProjects();
  const worlds = getWorldProfiles();
  const pathways = getPathwayProfiles();
  const concepts = getConceptProfiles();

  return {
    investigationCount: investigations.length,
    projectCount: projects.length,
    worldCount: worlds.length,
    pathwayCount: pathways.length,
    conceptCount: concepts.length,
    worlds,
    pathways,
    concepts,
  };
}
