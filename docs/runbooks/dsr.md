# Consent / DSR runbook

Purpose
-------
This runbook covers Data Subject Request (DSR) exports and consent ingestion
issues, including export failures and retention/purge problems.

Symptoms
--------
- `GET /api/consent` or `POST /api/dsr` returns errors
- Exports incomplete or missing records

Immediate checks
----------------
1. Confirm `CONSENT_ADMIN_KEY` is set and being sent in `x-consent-admin-key` header.
2. Review server logs for export or deletion failures.
3. Check Upstash (or local file fallback) for presence of consent events.

Quick verification
------------------
Example: request a small export (sanitized) against staging (replace URL):

```bash
curl -s -H "x-consent-admin-key: $CONSENT_ADMIN_KEY" \
  "https://staging.example.com/api/consent?limit=10" | jq .
```

Mitigation steps
----------------
1. If auth error: rotate `CONSENT_ADMIN_KEY` and redeploy secrets.
2. If Upstash failure: follow the Upstash runbook to restore KV access.
3. If missing records and local fallback used: verify file permissions and
   run the purge/replay scripts as needed.

Recovery & follow-up
--------------------
- Verify exported data integrity and confirm with requestor.  
- Record retention policy actions taken and ensure logs contain export audit
  entries.  
- Schedule a postmortem if data loss risk is identified.
