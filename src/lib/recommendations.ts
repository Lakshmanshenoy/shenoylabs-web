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

export function getRecommendedNextReads(currentSlug: string, limit = 3) {
  return getAllArticles()
    .filter((a) => a.slug !== currentSlug)
    .slice(0, limit);
}

export function getRelatedArticles(currentSlug: string, limit = 3) {
  const current = getArticle(currentSlug);
  const candidates = getAllArticles().filter((a) => a.slug !== currentSlug);

  return candidates
    .map((candidate) => {
      const categoryBoost =
        candidate.frontmatter.category === current.frontmatter.category ? 3 : 0;
      const tagScore = overlapScore(
        current.frontmatter.tags,
        candidate.frontmatter.tags,
      );
      return { candidate, score: categoryBoost + tagScore * 2 };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.candidate);
}

export function getRelatedProjectsForArticle(articleSlug: string, limit = 3) {
  const article = getArticle(articleSlug);

  return getAllProjects()
    .map((project) => ({
      project,
      score: overlapScore(article.frontmatter.tags, project.frontmatter.tags),
    }))
    .filter((item) => item.score > 0)
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
      score: overlapScore(current.frontmatter.tags, project.frontmatter.tags),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.project);
}

export type ArticleItem = ContentItem<ArticleFrontmatter>;
export type ProjectItem = ContentItem<ProjectFrontmatter>;
