#!/usr/bin/env bash
set -euo pipefail

# Poll GitHub Actions for a successful Playwright run on the branch
# and download the `playwright-report` artifact when available.

GH_PAGER=cat
BRANCH='fix/consent-json-fallback-1775983336'
WORKFLOW='playwright.yml'
MAX=180   # attempts (with SLEEP=10 -> 180*10s = 30 minutes)
SLEEP=10

for i in $(seq 1 $MAX); do
  echo "poll attempt $i/$MAX"
  # Fetch recent runs for the workflow (no branch filter); we'll match PR #7 in pull_requests
  info_json=$(GH_PAGER=cat gh run list --workflow="$WORKFLOW" --limit 20 --json id,status,conclusion,pull_requests,headBranch 2>/dev/null || echo '[]')
  info=$(node -e 'const s=process.stdin.read()||"[]"; const runs=JSON.parse(s); const targetPR=7; const found=runs.find(r=>Array.isArray(r.pull_requests)&&r.pull_requests.some(p=>p.number===targetPR)); if(found) console.log(`${found.id} ${found.status} ${found.conclusion||"null"}`);' <<<"$info_json" || true)
  if [ -z "$info" ]; then
    echo "no run found yet"
    sleep $SLEEP
    continue
  fi
  echo "run: $info"
  id=$(echo "$info" | awk '{print $1}')
  status=$(echo "$info" | awk '{print $2}')
  concl=$(echo "$info" | awk '{print $3}')
  if [ "$status" = "completed" ] && [ "$concl" = "success" ]; then
    echo "Found successful run $id"
    mkdir -p ci-artifacts
    echo "Downloading artifact 'playwright-report' for run $id"
    GH_PAGER=cat gh run download "$id" --name playwright-report --dir ci-artifacts || true
    if [ -d ci-artifacts ]; then ls -la ci-artifacts; fi
    index=$(find ci-artifacts -type f -name 'index.html' | head -n1 || true)
    if [ -n "$index" ]; then
      echo "Found report index: $index"
      echo "--- index.html head ---"
      head -n 200 "$index" || true
    else
      echo "No index.html found in artifacts"
    fi
    exit 0
  fi
  echo "Run $id status $status conclusion $concl; waiting..."
  sleep $SLEEP
done

echo "Timed out waiting for successful Playwright run"
exit 2
