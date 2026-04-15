# Cloudflare Turnstile runbook

Purpose
-------
Turnstile provides bot protection for interactive flows (contact form). This
runbook covers verification failures and token-related issues.

Symptoms
--------
- Contact submissions fail with verification errors
- Sudden increase in verification failure rates

Immediate checks
----------------
1. Confirm `TURNSTILE_SECRET_KEY` is present in server secrets.
2. Check server logs for verification failures and the returned Turnstile error
   messages.

Quick verification
------------------
Server-side verification example (sanitized):

```js
const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: tokenFromClient })
});
const json = await resp.json();
if (!json.success) console.error('Turnstile failed', json);
```

Mitigation steps
----------------
1. If secret is missing or changed, update platform secret and redeploy.
2. If failures spike, enable logging for token values (masked) for a short
   window and correlate with client IPs/UA for possible bot traffic.
3. Consider increasing monitoring on token replay or throttling rules.

Recovery & follow-up
--------------------
- Verify contact flow end-to-end after fix.  
- Add alerting on verification failure rate exceeding a threshold.  
- Document any token rotations performed.
