# Starter: Clone & Deploy

This repository can be used as a starter for a minimal, low-cost website.

Quick steps to get going:

1. Clone this repo:

```bash
git clone https://github.com/Lakshmanshenoy/shenoylabs-web.git
cd shenoylabs-web
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a Vercel project and import this repo:

- Use this import link to start a new Vercel project:
  https://vercel.com/import/project?template=https://github.com/Lakshmanshenoy/shenoylabs-web

4. Add environment variables in Vercel (see `content/articles/website-blueprint-integrations.mdx` for the env catalogue).

5. Deploy and preview. For local testing:

```bash
pnpm build
PORT=3000 pnpm start
# or for development
pnpm dev
```

Notes:
- Do NOT commit secrets. Use Vercel or your CI secret store for production keys.
- This README is a lightweight guide; see the article "How to build a website with almost no cost?" for full guidance.
