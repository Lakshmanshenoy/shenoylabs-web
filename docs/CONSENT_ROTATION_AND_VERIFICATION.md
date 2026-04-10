Consent Admin Key Rotation & Verification

Overview

This document describes rotating the `CONSENT_ADMIN_KEY`, updating production, and verifying consent persistence and DSR endpoints.

1) Generate a new admin key (example):

- Locally (already executed):
  - `openssl rand -hex 32`  # generated a new 64-hex char key

2) Update production environment

- Dashboard: Settings → Environment Variables → add/update `CONSENT_ADMIN_KEY` for `Production`, then redeploy the project.
- CLI (interactive):
  - `vercel env add CONSENT_ADMIN_KEY` and follow prompts (or use `vercel env` commands to set non-interactively).
- API (scripted): use Vercel REST API with a project token. Replace placeholders:

```sh
curl -X PATCH "https://api.vercel.com/v9/projects/<PROJECT_ID>/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"CONSENT_ADMIN_KEY","value":"<NEW_KEY>","target":["production"]}'
```

3) Redeploy

- After updating the production env var, trigger a new deployment so the server process reads the new key.

4) Verification checklist (after deploy)

- GET stored consent events (admin):

```sh
curl -i -H "x-consent-admin-key: <NEW_KEY>" https://shenoylabs.com/api/consent
```

- Create a test consent (public endpoint):

```sh
curl -i -X POST -H "Content-Type: application/json" \
  -d '{"action":"grant","type":"analytics","subject":"ci-verify@example.com"}' \
  https://shenoylabs.com/api/consent
```

- Re-run the admin GET to confirm the event appears.

- DSR export for subject (admin):

```sh
curl -i -X POST -H "Content-Type: application/json" -H "x-consent-admin-key: <NEW_KEY>" \
  -d '{"action":"export","subject":"ci-verify@example.com"}' https://shenoylabs.com/api/dsr
```

- (Optional) Delete subject events via DSR (admin):

```sh
curl -i -X POST -H "Content-Type: application/json" -H "x-consent-admin-key: <NEW_KEY>" \
  -d '{"action":"delete","subject":"ci-verify@example.com"}' https://shenoylabs.com/api/dsr
```

5) Notes & troubleshooting

- I attempted the GET/POST against https://shenoylabs.com and got a 404 response from the site (the request redirected to `www` then returned the standard 404 page). This usually means either:
  - the `/api/consent` route is not present on the currently deployed production build, or
  - domain rewrite/redirect rules are interfering with API routing, or
  - the production `CONSENT_ADMIN_KEY` is different and the GET returned `401` (but the server returned a 404 page in my attempts).

- If you see `401`/`unauthorized`, confirm the admin header matches the deployed `CONSENT_ADMIN_KEY` and that the deployment was restarted.

- If you see `404`, check that API routes are included in the deployed build and that any custom redirects/rewrite rules preserve the `/api/*` path.

6) What I changed locally

- Updated local `.env.local` with the new `CONSENT_ADMIN_KEY` for developer testing. You still need to update production.

If you want, I can:
- Attempt the verification curls again after you deploy the new `CONSENT_ADMIN_KEY` to Vercel, or
- Prepare a small script to update Vercel env using a provided `VERCEL_TOKEN` and `PROJECT_ID`.
