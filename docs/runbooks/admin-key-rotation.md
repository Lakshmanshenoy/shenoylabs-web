# Admin Key Rotation & Incident Runbook

Purpose: provide concise steps to rotate admin API keys and respond to suspected compromise of admin keys used by server routes.

Prerequisites
- Have CLI access to your deployment (Vercel, Azure, etc.) and permission to update environment variables.
- Know current admin key name(s): `ADMIN_API_KEY` and `CONSENT_ADMIN_KEY`.

When to rotate
- Suspected leak (token present in logs, public repo, or third-party alert).
- Compromise of a machine/user that had access to keys.
- Regular rotation policy (recommended every 90 days).

Quick rotation steps
1. Generate a new secret value (use a cryptographically secure generator):

```bash
# Example (Linux/macOS):
head -c 24 /dev/urandom | base64 | tr -d '\n'
```

2. Add the new secret to your hosting provider as a new environment variable (do not overwrite running key yet). Name it `ADMIN_API_KEY_NEW` or similar.

3. Update your deployment to accept both keys during a transition window. On the server, the code reads `ADMIN_API_KEY` and `CONSENT_ADMIN_KEY`; update your environment mapping to temporarily accept the new value (or update code to look for `ADMIN_API_KEY_NEW` first).

4. Deploy the change and verify that admin endpoints work with the new key.

5. Remove the old key from environment variables and configuration.

6. Re-deploy and verify all services.

Emergency revocation (immediate)
1. Remove the compromised key from your hosting provider immediately.
2. Create and add a new key as `ADMIN_API_KEY`.
3. Configure clients/scripts that used the old key with the new key.
4. Review logs for suspicious usage during the period of suspected compromise.
5. Revoke any long-lived tokens that might have been issued.

Post-incident actions
- Rotate other related keys if they were present on the compromised machine.
- Review CI configuration and repository secrets (GitHub Actions secrets, Vercel environment variables).
- Update team members and require multi-factor authentication for accounts with access.
- Perform a root-cause analysis and store notes in the incident tracker.

Contact & escalation
- Repository owner: @Lakshmanshenoy
- For infrastructure access issues, contact the cloud provider support.

Notes
- Do not commit keys to the repository. If a key is committed, rotate immediately and remove the file from history.
- Keep a secure record of rotation events (who rotated, when, reason) in the project runbook.
