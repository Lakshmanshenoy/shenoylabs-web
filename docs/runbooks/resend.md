# Resend (email) runbook

Purpose
-------
Resend handles outgoing email for contact submissions. This runbook covers
delivery failures, quota issues, and bounce monitoring.

Symptoms
--------
- Contact form submits but no email delivered
- High number of send errors or bounces reported by Resend

Immediate checks
----------------
1. Confirm `RESEND_API_KEY` exists in secrets.
2. Inspect Resend dashboard for delivery errors and bounce details.

Quick verification
------------------
Sanitized example to test send (replace placeholders locally):

```js
await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: process.env.CONTACT_FROM_EMAIL,
    to: process.env.CONTACT_TO_EMAIL,
    subject: 'Test',
    html: '<p>Test</p>'
  })
});
```

Mitigation steps
----------------
1. If API key invalid: rotate the key in Resend, update secrets, and redeploy.
2. If quota exceeded: request quota increase or throttle send rate and queue
   for retry.
3. For bounces: inspect recipient addresses and SPF/DKIM configuration.

Recovery & follow-up
--------------------
- Re-send failed messages if appropriate and document the root cause.  
- Add monitoring for send error rate and bounce percentage.  
- Ensure SPF/DKIM/DMARC records are configured for the sending domain.
