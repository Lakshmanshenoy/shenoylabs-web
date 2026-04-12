#!/usr/bin/env bash
set -euo pipefail

# Verify CONSENT_ADMIN_KEY and exercise consent endpoints.
# Usage:
# BASE_URL (optional) - defaults to http://localhost:3000
# CONSENT_ADMIN_KEY must be set for admin operations
# Example:
# BASE_URL=https://shenoylabs.com CONSENT_ADMIN_KEY=<key> ./scripts/verify_consent_key.sh

BASE_URL="${BASE_URL:-http://localhost:3000}"

if [ -z "${CONSENT_ADMIN_KEY:-}" ]; then
  echo "Error: CONSENT_ADMIN_KEY is not set. Export it and re-run the script."
  exit 1
fi

echo "Using BASE_URL=$BASE_URL"

echo "\n1) GET /api/consent (admin)"
curl -s -i -H "x-consent-admin-key: ${CONSENT_ADMIN_KEY}" "${BASE_URL%/}/api/consent" || true

echo "\n2) POST test consent (public)"
curl -s -i -X POST -H "Content-Type: application/json" \
  -d '{"action":"grant","type":"analytics","subject":"ci-verify@example.com"}' \
  "${BASE_URL%/}/api/consent" || true

echo "\n3) Re-check GET /api/consent (admin)"
curl -s -i -H "x-consent-admin-key: ${CONSENT_ADMIN_KEY}" "${BASE_URL%/}/api/consent" || true

echo "\nDone. Inspect responses above for status codes and the presence of the test event."
