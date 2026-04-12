# CI — Playwright / pnpm / Vitest Troubleshooting

Short troubleshooting notes for common CI failures seen in this repo (pnpm missing, Vitest picking up Playwright tests, Node.js 20 deprecation warnings).

## Symptoms
- `Error: Unable to locate executable file: pnpm` in GitHub Actions logs (actions/setup-node step).
- `Playwright Test did not expect test() to be called here.` when Vitest/CI runs (Playwright tests imported by another runner).
- Warnings about Node.js 20 being deprecated for some actions.

## Root causes
- `actions/setup-node`'s `cache: 'pnpm'` option can make the action expect `pnpm` to be available before we've installed/activated it.
- The runner may not have a global `pnpm` on PATH; workflows must either enable `corepack` or install pnpm (eg. `pnpm/action-setup`).
- Vitest can accidentally collect Playwright e2e files (e.g. `tests/**`) which import `@playwright/test`. That leads to conflicts because Playwright's test runner exports `test()` and expects to be run by `npx playwright test`, not vitest.
- Some actions were still pinned to Node.js 20; GitHub is forcing JS actions to run on Node.js 24. That causes deprecation warnings when action majors target Node 20.

## Fixes applied in this branch
- Removed the `cache: 'pnpm'` input from `actions/setup-node` (Playwright workflow) which could trigger pnpm usage too early.
- Added `pnpm/action-setup@v6` to ensure pnpm is installed and on PATH before using it.
- Added `actions/cache@v5` for caching `~/.pnpm-store` so installs are faster.
- Use `npx pnpm@10 install --frozen-lockfile` in workflows to avoid depending on a preinstalled global pnpm.
- Added `vitest.config.ts` to explicitly include only `test/` unit tests and exclude the Playwright `tests/` e2e directory.
- Opted into Node.js 24 for JavaScript actions via `env: FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: 'true'` and bumped action major versions (e.g. `actions/checkout@v6`, `actions/setup-node@v6`, `actions/upload-artifact@v7`).

## How to reproduce locally

- Run unit tests:

```bash
pnpm exec vitest --run
```

- Run Playwright e2e (build + start server is required by the config):

```bash
pnpm build && PORT=3001 pnpm start &
pnpm exec playwright test --project=chromium --reporter=list
```

## Quick CI debug steps
- Print node & pnpm versions in the job to validate environment:

```yaml
- name: Debug node & pnpm
  run: |
    node -v
    corepack enable
    corepack prepare pnpm@10 --activate
    pnpm -v || true
```

- If you see the `test() did not expect test()` Playwright error, check for duplicate `@playwright/test` versions:

```bash
pnpm why @playwright/test
```

and check `pnpm-lock.yaml` for multiple versions.

## Why `vitest.config.ts` matters
- Vitest's default globs can match `*.spec.ts` files in `tests/`. Playwright test files import and call Playwright's `test()` API; vitest collecting those files tries to execute them under its environment and that triggers the "test() did not expect test() to be called here" error. The config added to this repo restricts vitest to `test/` only and excludes `tests/`.

## Recommended workflow snippet (key parts)

```yaml
env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: 'true'

- uses: actions/checkout@v6
- uses: actions/setup-node@v6
  with:
    node-version: '24'
- name: Setup pnpm
  uses: pnpm/action-setup@v6
  with:
    version: '10'
- name: Cache pnpm store
  uses: actions/cache@v5
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('pnpm-lock.yaml') }}
- name: Install dependencies
  run: npx pnpm@10 install --frozen-lockfile
- name: Run Playwright tests
  run: npx playwright test --project=chromium --reporter=html
```

## Rollback / revert
- To revert the CI/workflow changes: use `git revert <commit>` for the change commits and push a revert branch.

## Notes / future improvements
- Consider consolidating the `pnpm` version used in CI across jobs (use a single `pnpm` action and `npx pnpm@...` when needed).
- Add an explicit `pnpm why @playwright/test` check if you see test runner conflicts.
- Add a CI job that runs only Playwright e2e on a matrix OS to catch environment-specific issues earlier.

---
Author: automated troubleshooting notes (applied in branch `fix/consent-json-fallback-1775983336`)
