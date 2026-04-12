#!/usr/bin/env bash
set -euo pipefail

# Usage: set VERCEL_TOKEN, PROJECT_ID, and NEW_KEY env vars
# Example:
# VERCEL_TOKEN=... PROJECT_ID=... NEW_KEY=$(openssl rand -hex 32) ./scripts/set_vercel_env.sh

if [ -z "${VERCEL_TOKEN:-}" ] || [ -z "${PROJECT_ID:-}" ] || [ -z "${NEW_KEY:-}" ]; then
  echo "Missing required env vars. Set VERCEL_TOKEN, PROJECT_ID, and NEW_KEY."
  exit 1
fi

echo "Updating CONSENT_ADMIN_KEY for project $PROJECT_ID"

read -r -d '' PAYLOAD <<EOF
{"key":"CONSENT_ADMIN_KEY","value":"$NEW_KEY","target":["production"]}
EOF

curl -s -X PATCH "https://api.vercel.com/v9/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"

echo "Request sent. Verify the new value in the Vercel dashboard or via the API."