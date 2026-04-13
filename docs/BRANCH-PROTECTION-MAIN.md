# Branch protection — `main`

Date: 2026-04-13

This document summarizes the branch protection rules currently configured for the repository's `main` branch and provides quick commands to view or update them.

**Current settings (summary)**

- **Branch:** `main`
- **Enforce for administrators:** true (rules apply to org/repo admins)
- **Required approving reviews:** 1
- **Dismiss stale reviews:** true
- **Strict status checks (require up-to-date before merge):** true
- **Allow force pushes:** false
- **Allow deletions:** false

Note: the protection also requires passing status checks before merging (see how to view below for the precise list of required contexts).

**Why these rules exist**

- Ensure code is reviewed before merging.
- Keep `main` stable by requiring CI and status checks to pass and to be up-to-date with the base branch before merge.

**How to view the rules**

- GitHub CLI (recommended):

```bash
gh api repos/${{OWNER}}/${{REPO}}/branches/main/protection
```

- REST API (example):

```bash
curl -H "Accept: application/vnd.github+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/branches/main/protection
```

Replace `OWNER`/`REPO` with the repository owner and name.

**How to update the rules (example)**

Updating branch protection requires repository administrative privileges. Example payload (PUT) to set basic rules via the REST API:

```bash
curl -X PUT \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/branches/main/protection \
  -d '{
    "required_status_checks": { "strict": true, "contexts": ["ci"] },
    "enforce_admins": true,
    "required_pull_request_reviews": { "required_approving_review_count": 1, "dismiss_stale_reviews": true },
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false
  }'
```

Adjust the `contexts` array to list the exact required status checks for your repo (you can retrieve them first using the `gh api` or the web UI).

**Notes / history**

- These protection rules were applied during the CI/workflow fixes in April 2026 to ensure merges to `main` require reviews and passing checks.
- A feature branch used for the Playwright/pnpm fixes was merged and removed; branch-protection attempts for that temporary branch returned "branch not found" after merge.

**Contacts**

- Repo admins / maintainers: check the repository's team or owners for who can modify these settings.

If you want, I can open a PR with this doc or push it to the branch for you.
