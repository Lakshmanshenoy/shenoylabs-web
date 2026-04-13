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
