# Upstash KV runbook

Purpose
-------
Upstash (Redis KV via REST) stores rate-limit buckets, consent event queues,
DSR queues, and ephemeral tokens. This runbook helps diagnose auth, latency,
and availability issues.

Symptoms
--------
- `POST /api/contact` fails intermittently or returns rate-limit errors
- Increased API latency or timeouts when contacting Upstash
- Auth failures (401/403) from Upstash

Immediate checks
----------------
1. Confirm `KV_REST_API_URL` and `KV_REST_API_*` tokens exist in platform secrets.
2. Review server logs for Upstash errors (HTTP 4xx/5xx) and timestamps.
3. Check Upstash status/dashboard for outages or throttling.

Quick verification
------------------
Use the read-only token for a safe check (replace placeholders locally):

```bash
curl -s -H "Authorization: Bearer $KV_REST_API_READ_ONLY_TOKEN" \
  "$KV_REST_API_URL/lrange/consent_events/0/10" | jq .
```

If this returns data, basic connectivity and auth are OK.

Mitigation steps
----------------
1. If auth errors: rotate tokens (create a new read/write token in Upstash),
   update platform secrets, and redeploy.
2. If high latency: check Upstash regional settings and consider failover or
   caching of critical small reads.
3. If throttled: review the application's rate usage and increase quotas or
   add backoff/retry logic in API callers.

Recovery & follow-up
--------------------
- After restoring service, run end-to-end checks (contact form, consent
  ingestion).  
- Add alerting on p95/p99 latency and error rate for Upstash calls.  
- Perform a postmortem documenting root cause and token rotation if credentials
  changed.
