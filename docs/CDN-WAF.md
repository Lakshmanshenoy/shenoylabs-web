CDN Rate Limits & WAF (Edge protection)
======================================

This document describes a simple, repo-driven approach to enforce rate limits
and block obvious bots at the CDN/edge level using Next.js Edge Middleware
backed by Upstash Redis for counters.

What this implements
- Per-IP rate limiting for `/api/*` requests using an atomic INCR + TTL on Upstash.
- Basic bot detection that blocks common CLI/automated user-agents and logs events.

Environment
- `KV_REST_API_URL` and `KV_REST_API_TOKEN` (Upstash REST Redis) — already used by the project.
- Optional runtime variables you can set in your deployment (Vercel/Netlify/Cloudflare):
  - `RATE_LIMIT_REQUESTS` (default: 60)
  - `RATE_LIMIT_WINDOW_S` (default: 60)

  Additional runtime tuning (no added provider cost):

  - `LOG_SAMPLE_RATE` (default: 10) — only 1-in-N events are written to Upstash for logging. Use a higher value to reduce write volume.
  - The middleware sets the Upstash key TTL only when the counter is first created to avoid an extra write on every request.

Notes and next steps
- This middleware is a software-layer protection; for higher capacity and stricter
  enforcement use your CDN/WAF provider's built-in rate limiting (Cloudflare Rate
  Limiting, AWS WAF, Fastly, Akamai). Those operate closer to the network edge
  and are more reliable under extreme load.
- Consider adding a JS challenge (Turnstile/CAPTCHA) flow for suspected bots instead
  of outright blocking, to reduce false positives.
- Add a blacklist/allowlist management system (persisted in Upstash or provider rules).
- Add monitoring/alerts for large numbers of `bad-bots` or repeated 429 responses.

Security & availability
- The middleware is intentionally "fail-open": Upstash errors will not block traffic.
  If you need fail-closed semantics, change behavior in `src/middleware.ts` accordingly.
