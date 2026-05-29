# ShenoyLabs

ShenoyLabs is the public website and publishing system for Lakshman Shenoy's research, long-form writing, and projects built in public.

Live site: https://www.shenoylabs.com

The product goal is simple: publish thoughtful work with a calm editorial interface, strong reading performance, and enough operational discipline that the site can be maintained long-term without paid tooling.

## What This Repo Contains

- A public-facing Next.js site for articles, projects, support, contact, and policy pages.
- A content pipeline powered by MDX and JSON content files.
- TinaCMS configuration for editorial workflows.
- Small operational APIs for contact, consent, DSR, media PR creation, payments, and OG image generation.
- Repo-level checks and runbooks intended to keep quality high without adding heavy process.

## Product Principles

- Editorial-first: readable typography, calm pacing, and long-form content that does not feel like a SaaS landing page.
- Built in public: projects and process are visible, documented, and linked back to source where useful.
- No-cost discipline: quality should come from automation and review, not expensive tooling.
- Operational clarity: consent, retention, support, and publishing flows are documented in-repo.

The editorial contract for new pages and articles lives in `docs/EDITORIAL-IDENTITY-CONTRACT.md`.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- TinaCMS
- Vitest and Playwright
- GitHub Actions for CI and operational jobs

## Repository Map

```text
src/
  app/                 App Router pages and API routes
  components/          UI building blocks by feature area
  lib/                 Content loading, metadata, and utilities
content/
  articles/            MDX articles
  homepage/            Home page content JSON
  pages/               Standalone page content
  projects/            Project content
docs/                  Editorial and operational documentation
scripts/               Checks, validation, verification, and helper scripts
tests/                 Playwright end-to-end tests
test/                  Vitest coverage for utilities and server behavior
tina/                  TinaCMS schema and generated artifacts
```

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the site locally:

```bash
pnpm dev
```

Open `http://localhost:3000`.

Run Tina locally with the isomorphic Git bridge:

```bash
pnpm dev:tina
```

Use this mode when you want the admin sidebar and local content editing without Tina Cloud.

If you use the local Git-backed editing flow, make sure Git has an author configured:

```bash
git config user.name "Your Name"
git config user.email "you@example.com"
```

## Quality Checks

The main developer gate is the repo check script:

```bash
pnpm run check
```

Equivalent direct invocation:

```bash
bash ./scripts/checks.sh
```

What it covers:

- ESLint
- TypeScript type-checking
- Featured project validation
- Content quality validation
- Detection of common hyphenated DOM attribute mistakes in MDX and JSX

CI mode adds tests and a production build:

```bash
bash ./scripts/checks.sh --ci
```

Supporting notes live in `README-CHECKS.md` and `docs/TEN-OUT-OF-TEN-QA-CHECKLIST.md`.

## Content Workflow

Most content lives under `content/`:

- `content/articles/` for long-form articles
- `content/projects/` for project entries
- `content/pages/` for standalone pages such as About and Support
- `content/homepage/` for homepage copy and hero content

The site metadata is defined in `src/lib/site.ts` and can be overridden through environment variables.

When adding or editing content:

1. Update the relevant MDX or JSON file.
2. Run `pnpm run check`.
3. Review the output against the editorial contract and QA checklist.
4. Verify the change in the browser, especially for spacing, headings, and mobile readability.

## Integrations And Environment

Core environment variables are documented in `.env.example`.

Key integration groups:

- Site metadata and analytics: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_DESCRIPTION`, `NEXT_PUBLIC_GA_ID`
- Contact form and email delivery: `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`
- Human verification: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- Support and payments: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- GitHub-backed editorial flow: `GITHUB_TOKEN`, `GITHUB_REPOSITORY`, `GITHUB_BASE_BRANCH`

## Tina And GitHub Publishing Flows

This repo supports two editorial modes:

### 1. Local Git bridge

Use `pnpm dev:tina` for local editing with Tina's isomorphic Git bridge. Content changes are written directly into the local repository.

### 2. GitHub-backed PR flow

The repo also exposes helper endpoints for a self-hosted admin that opens pull requests instead of writing directly to the filesystem:

- `/api/tina/github`
- `/api/tina/github/tree`

Use these when editors should produce reviewable GitHub changesets rather than local commits.

The Tina admin build workflow is defined in `.github/workflows/build-tina-admin.yml`.

## API Surface

Notable application endpoints include:

- `/api/contact`
- `/api/consent`
- `/api/dsr`
- `/api/create-order`
- `/api/verify-payment`
- `/api/media/prs`
- `/api/og`

These routes support contact handling, privacy workflows, payment flows, media contribution review, and social preview generation.

## Operations And Runbooks

Operational guidance is intentionally kept close to the codebase.

Useful starting points:

- `docs/CONSENT_ROTATION_AND_VERIFICATION.md`
- `docs/DATA_RETENTION.md`
- `docs/CDN-WAF.md`
- `docs/CI-Playwright-Troubleshooting.md`
- `docs/runbooks/`

To verify consent admin behavior after deployment, use:

```bash
BASE_URL=$(grep -E '^NEXT_PUBLIC_SITE_URL=' .env.local | cut -d= -f2-) \
CONSENT_ADMIN_KEY=$(grep -E '^CONSENT_ADMIN_KEY=' .env.local | cut -d= -f2-) \
bash scripts/verify_consent_key.sh
```

Or run against production directly:

```bash
BASE_URL=https://shenoylabs.com CONSENT_ADMIN_KEY=<your_key_here> bash scripts/verify_consent_key.sh
```

## CI And Automation

GitHub Actions in `.github/workflows/` cover:

- continuous integration
- Playwright execution
- Tina admin build publishing
- consent cleanup
- rate-limit monitoring

## Contributing

Open a branch, keep changes focused, and run `pnpm run check` before pushing.

For pnpm build-script allowlist changes and related review rules, see `CONTRIBUTING.md`.
