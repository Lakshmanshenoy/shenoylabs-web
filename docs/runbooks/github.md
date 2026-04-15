# GitHub PR / commit runbook

Purpose
-------
This runbook addresses failures when creating branches, commits, or PRs via
server endpoints (Tina helpers, media PRs).

Symptoms
--------
- API returns 401/403/422 when attempting to create PRs or commits
- GitHub API rate-limit (429) or transient 5xx errors

Immediate checks
----------------
1. Confirm `GITHUB_TOKEN` is configured in secrets and `GITHUB_REPOSITORY` is
   correct.
2. Check server logs for GitHub API responses (status codes and messages).
3. Inspect GitHub Actions / App settings for recent permission changes.

Quick verification
------------------
Test repository access with the token (sanitized):

```bash
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_REPOSITORY" | jq .
```

Mitigation steps
----------------
1. If 401/403: confirm token scopes or switch to a GitHub App with appropriate
   repository write permissions.  
2. If rate-limited: implement retries with exponential backoff and check
   whether the job can be batched.
3. If 422 (unprocessable): validate payloads (file paths, branch names) and
   ensure base branch exists.

Recovery & follow-up
--------------------
- Rotate or replace tokens if compromised.  
- Add specific logging for failed payloads to aid debugging (no secrets).  
- Document recommended token scope and prefer GitHub App over broad PATs.
