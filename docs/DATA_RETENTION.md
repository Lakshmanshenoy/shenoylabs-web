# Data Retention Policy

This document records the concrete retention windows for different classes of data stored or processed by this project. These are default values and are configurable; see `src/lib/data-retention.ts`.

Retention windows (recommended defaults):

- **Server logs (application logs, request traces)**: 90 days
- **Analytics (raw event-level data)**: 13 months (395 days)
- **Email delivery metadata (Resend/Webhook events, delivery receipts)**: 90 days
- **Consent audit trail (grant/deny/revoke events)**: 5 years (1825 days)
- **DSR export artifacts (generated archives for a subject export)**: 30 days
- **Turnstile token replay cache entries**: 5 minutes (live verification TTL; short-lived)

Rationale:
- Keep logging short enough to reduce PII exposure while retaining operational debugging ability.
- Analytics default mirrors common analytics retention settings (commercial products often allow 14 months; we use 13 months as a privacy-conscious default).
- Consent audit trail is retained for a longer period for compliance and audit purposes; consider legal requirements in your jurisdiction and counsel guidance.

Enforcement:

- A maintenance script is provided at `scripts/purge_old_consent.js` which can be run manually or scheduled (cron) to delete consent events older than the configured retention window. It supports both Upstash (if `KV_REST_API_URL`/`KV_REST_API_TOKEN` are configured) and the local-file fallback `data/consent-events.ndjson`.
- Operators should schedule retention/purge jobs for other data (logs, analytics exports, backups) according to their hosting and logging solutions (log drains, cloud logging retention policies, etc.).

Configuration:

- The default retention windows are declared in `src/lib/data-retention.ts`.
- You can override the consent purge retention via the environment variable `CONSENT_RETENTION_DAYS` when running the purge script.

Legal note:

- These defaults are suggestions only. Please consult legal counsel to confirm retention windows meet applicable laws and regulations in your jurisdictions.
