Security hardening + contact form reliability + exposure guard

Summary

- Add admin rate limiter and enforce on admin-protected endpoints to reduce abuse.
- Add `security` CI job that runs `pnpm audit --audit-level=high` and `scripts/checks.sh --ci --install` on PRs.
- Commit `.pnpm/allow-builds.json` to satisfy pnpm's CI `onlyBuiltDependencies` guard and unblock builds.
- Fix contact form reliability: set `submittedAt` client-side to avoid anti-spam false positives; add Turnstile diagnostics and a dev fallback for test keys.
- Namespace Upstash rate-limit keys to avoid collisions (e.g., `rl:contact:...`, `rl:admin:...`) and added diagnostics for Upstash errors.
- Add `docs/runbooks/admin-key-rotation.md` with quick rotation and incident response steps.
- Add exposure-guard checks in `scripts/checks.sh` to detect tracked runtime artifacts and secret-like strings.

Notes

- Local checks: lint, typecheck, content validators, tests, and production build passed locally on this branch.
- Please re-run the GitHub Actions CI to validate the `security` job in PR pipelines.

Files touched (high level):
- `src/lib/admin-rate-limit.ts` (new)
- `src/lib/admin-auth.ts` (auth + rate-limit integration)
- Multiple admin-protected route handlers updated to `await requireAdminAuth(req)`
- `src/app/api/contact/route.ts` and `src/components/contact/contact-form.tsx` (contact reliability + Turnstile)
- `.pnpm/allow-builds.json` (committed to allow pnpm builds in CI)
- `.github/workflows/ci.yml` (added `security` job)
- `scripts/checks.sh` (exposure-guard + checks)
- `docs/runbooks/admin-key-rotation.md` (new)

If you'd like, I can update the PR description directly (via `gh pr edit`) if you authorize the CLI or provide a token; otherwise you can copy this file's content into PR #46.
