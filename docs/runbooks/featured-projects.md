# Featured Projects (Runbook)

Purpose: explain how to mark a project as featured on the homepage and recommended workflows.

- Canonical source: `content/projects/*` MDX files. The homepage derives featured projects from project frontmatter using `featured: true`.
- Optional ordering: set `featuredOrder: 1` to control display order (1 = first). Orders must be a compact sequence starting at 1 (the checks script validates this).
- If no projects set `featured: true`, the homepage will fall back to showing up to three most recently `shipped` projects.

Recommended steps to feature a project:

1. Edit the project's MDX file under `content/projects/<slug>.mdx`.
2. Add the frontmatter fields:

```yaml
featured: true
featuredOrder: 1 # optional
```

3. Run the checks locally:

```bash
pnpm run validate:featured
pnpm run check
```

4. Push a branch and open a PR. The CI will run the validation as part of `scripts/checks.sh`.

Migration notes: legacy homepage JSON removed; use project frontmatter instead.
