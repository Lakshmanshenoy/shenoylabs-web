import {
  getAllArticles,
  getAllProjects,
  getArticle,
  getProject,
  type ContentItem,
  type ArticleFrontmatter,
  type ProjectFrontmatter,
} from "@/lib/content";

function overlapScore(a: string[], b: string[]) {
  const set = new Set(a.map((x) => x.toLowerCase()));
  return b.reduce((acc, x) => acc + (set.has(x.toLowerCase()) ? 1 : 0), 0);
}

function semanticTerms(frontmatter: ArticleFrontmatter): string[] {
  return [
    ...frontmatter.tags,
    ...frontmatter.research_worlds,
    ...frontmatter.concepts,
    ...frontmatter.pathways,
  ];
}

export function getRecommendedNextReads(currentSlug: string, limit = 3) {
  const current = getArticle(currentSlug);
  const currentTerms = semanticTerms(current.frontmatter);

  return getAllArticles()
    .filter((a) => a.slug !== currentSlug)
    .map((candidate) => {
      const pathwayBoost = overlapScore(
        current.frontmatter.pathways,
        candidate.frontmatter.pathways,
      );
      const semanticBoost = overlapScore(currentTerms, semanticTerms(candidate.frontmatter));
      const explicitBoost = current.frontmatter.related_investigations.includes(candidate.slug)
        ? 4
        : 0;
      return {
        candidate,
        score: explicitBoost + pathwayBoost * 3 + semanticBoost * 2,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.candidate);
}

export function getRelatedArticles(currentSlug: string, limit = 3) {
  const current = getArticle(currentSlug);
  const candidates = getAllArticles().filter((a) => a.slug !== currentSlug);
  const explicit = new Set(current.frontmatter.related_investigations);
  const temporal = new Set(current.frontmatter.temporal_callbacks);
  const currentTerms = semanticTerms(current.frontmatter);

  return candidates
    .map((candidate) => {
      const categoryBoost =
        candidate.frontmatter.primaryCategory ===
        current.frontmatter.primaryCategory
          ? 3
          : 0;
      const tagScore = overlapScore(currentTerms, semanticTerms(candidate.frontmatter));
      const explicitBoost = explicit.has(candidate.slug) ? 5 : 0;
      const temporalBoost =
        temporal.has(candidate.slug) ||
        candidate.frontmatter.temporal_callbacks.includes(currentSlug)
          ? 4
          : 0;
      return {
        candidate,
        score: explicitBoost + temporalBoost + categoryBoost + tagScore * 2,
      };
    })
    .filter((item) => item.score > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.candidate);
}

export function getRelatedProjectsForArticle(articleSlug: string, limit = 3) {
  const article = getArticle(articleSlug);
  const explicit = new Set(article.frontmatter.related_projects);
  const terms = semanticTerms(article.frontmatter);

  return getAllProjects()
    .map((project) => ({
      project,
      score:
        overlapScore(terms, project.frontmatter.tags) +
        (explicit.has(project.slug) ? 4 : 0),
    }))
    .filter((item) => item.score > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.project);
}

export function getRelatedArticlesForProject(projectSlug: string, limit = 3) {
  const project = getProject(projectSlug);

  return getAllArticles()
    .map((article) => ({
      article,
      score: overlapScore(project.frontmatter.tags, article.frontmatter.tags),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.article);
}

export function getRelatedProjects(projectSlug: string, limit = 3) {
  const current = getProject(projectSlug);

  return getAllProjects()
    .filter((p) => p.slug !== projectSlug)
    .map((project) => ({
      project,
      score:
        overlapScore(current.frontmatter.tags, project.frontmatter.tags) +
        (current.frontmatter.primaryCategory ===
        project.frontmatter.primaryCategory
          ? 2
          : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.project);
}

export type ArticleItem = ContentItem<ArticleFrontmatter>;
export type ProjectItem = ContentItem<ProjectFrontmatter>;
