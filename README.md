# Development

Run the checks (ESLint + TypeScript) locally:

```bash
# preferred (uses your package manager to run the script)
pnpm run check
# or
npm run check
```

Or run the script directly:

```bash
sh ./scripts/checks.sh
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### TinaCMS

This repository includes a TinaCMS schema at `tina/config.ts` for MDX and homepage JSON content.

Run Tina + Next locally:

```bash
pnpm dev:tina
```

Use the regular app server (without Tina sidebar):

```bash
pnpm dev
```

For cloud-backed Tina editing/builds, set:

```bash
NEXT_PUBLIC_TINA_CLIENT_ID=<your_client_id>
TINA_TOKEN=<your_readonly_token>
```

Local Git bridge (no cloud)

This repository supports a local Git-backed editing flow using Tina's isomorphic git bridge. Edits made in the Tina admin will be committed directly into the repository on the machine running the dev server.

Quick start (local only):

```bash
# Run the site with Tina admin and local git bridge
pnpm dev:tina
```

Notes:
- Ensure your git user is configured so commits have an author:

```bash
git config user.name "Your Name"
git config user.email "you@example.com"
```
- After editing in the admin, review changes with `git status` and push as usual.

GitHub-backed (no Tina Cloud)

If you prefer web editing for collaborators without using Tina Cloud, we can add a GitHub-backed flow next. That requires a GitHub token for the server to create commits/PRs and a small server-side bridge or configuration to push changes.

GitHub-backed (self-hosted admin, no Tina Cloud)

This repo includes a small helper API at `/api/tina/github` that can create a branch, commit file changes, and open a pull request using a GitHub token. This enables a self-hosted web admin that writes edits back to your repo without Tina Cloud.

Steps to use the GitHub flow

1. Create a GitHub Personal Access Token with `repo` scope.
2. Set environment variables (see `.env.example`):

```
GITHUB_TOKEN=ghp_xxx
GITHUB_REPOSITORY=owner/repo
GITHUB_BASE_BRANCH=main
```

3. Build or run your admin and wire the admin save action to POST to `/api/tina/github` with JSON like:

```json
{
	"changes": [
		{ "path": "content/homepage/hero.json", "content": "{...}" }
	],
	"commitMessage": "Update homepage hero",
	"prTitle": "Content updates via Tina"
}
```

4. The API will create a branch `tina-edit-<ts>`, commit the changed files, and open a pull request into the base branch.

Notes & next steps

- This helper intentionally performs per-file content updates using the GitHub Contents API (simple, robust for MDX/JSON edits). For bulk edits in a single commit, we can extend it to create trees + single commit instead.
- If you want, I can wire the generated Tina admin to call this endpoint automatically on save, and add a CI job to build and publish the admin to `/admin` on merges.

CI: build Tina admin

There is a GitHub Actions workflow that builds the Tina admin and uploads it as an artifact on pushes to `main`. It also supports a manual `workflow_dispatch` run that will copy the built `admin/` into `public/admin` and commit it back to the repository (useful for publishing a static admin bundle).

The workflow file is `.github/workflows/build-tina-admin.yml`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Verification

To verify the `CONSENT_ADMIN_KEY` and exercise the consent endpoints after deployment or when testing locally:

- Ensure the production environment variable `CONSENT_ADMIN_KEY` is set in your deployment environment.
- The repository includes a helper script: [scripts/verify_consent_key.sh](scripts/verify_consent_key.sh).

Example — use the key from your local `.env.local` and run the script from the repo root:

```bash
BASE_URL=$(grep -E '^NEXT_PUBLIC_SITE_URL=' .env.local | cut -d= -f2-) \
CONSENT_ADMIN_KEY=$(grep -E '^CONSENT_ADMIN_KEY=' .env.local | cut -d= -f2-) \
bash scripts/verify_consent_key.sh
```

Or run against a deployed URL:

```bash
BASE_URL=https://shenoylabs.com CONSENT_ADMIN_KEY=<your_key_here> bash scripts/verify_consent_key.sh
```

Check the script output for HTTP status codes and presence of the `events` array in the admin GET response.
