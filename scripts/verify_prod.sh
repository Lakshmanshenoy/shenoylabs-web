#!/usr/bin/env bash
set -euo pipefail

ADMIN_KEY=$(grep -E '^CONSENT_ADMIN_KEY=' .env.local | sed 's/^CONSENT_ADMIN_KEY=//')
echo "ADMIN_KEY present: ${ADMIN_KEY:+yes}"

echo "\n== POST /api/consent (grant) =="
curl -s -i -L -m 15 -X POST 'https://shenoylabs.com/api/consent' -H 'Content-Type: application/json' -d '{"action":"grant","type":"analytics","subject":"ci-verify@example.com"}' || true

echo "\n== GET /api/consent (admin) =="
curl -s -i -L -m 15 -H "x-consent-admin-key: $ADMIN_KEY" 'https://shenoylabs.com/api/consent' || true

echo "\n== POST /api/dsr export =="
curl -s -i -L -m 15 -X POST -H "Content-Type: application/json" -H "x-consent-admin-key: $ADMIN_KEY" -d '{"action":"export","subject":"ci-verify@example.com"}' 'https://shenoylabs.com/api/dsr' || true

echo "\n== POST /api/dsr delete =="
curl -s -i -L -m 15 -X POST -H "Content-Type: application/json" -H "x-consent-admin-key: $ADMIN_KEY" -d '{"action":"delete","subject":"ci-verify@example.com"}' 'https://shenoylabs.com/api/dsr' || true

echo "\n== POST /api/contact (missing captcha) =="
TS=$(node -e 'console.log(Date.now()-5000)')
BODY=$(printf '{"name":"CI Tester","email":"ci@example.com","subject":"CI test","message":"This is an automated test message for CI that is definitely longer than twenty characters.","submittedAt":%s}' "$TS")
curl -s -i -L -m 15 -X POST -H 'Content-Type: application/json' -d "$BODY" 'https://shenoylabs.com/api/contact' || true
