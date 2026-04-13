#!/usr/bin/env node
// Monitor Upstash lists for spikes and open a GitHub issue when thresholds exceeded.
// Environment variables:
// - KV_REST_API_URL (required)
// - KV_REST_API_TOKEN (required)
// - THRESHOLD_BAD_BOTS (optional, default 50)
// - THRESHOLD_RATE_LIMIT_EVENTS (optional, default 10)
// - GITHUB_REPOSITORY (owner/repo) (provided by Actions)
// - GITHUB_TOKEN (provided by Actions)

async function run() {
  const KV_REST_API_URL = process.env.KV_REST_API_URL;
  const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
  const THRESHOLD_BAD_BOTS = Number(process.env.THRESHOLD_BAD_BOTS ?? 50);
  const THRESHOLD_RATE_LIMIT_EVENTS = Number(process.env.THRESHOLD_RATE_LIMIT_EVENTS ?? 10);
  const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    console.log("KV_REST_API_URL or KV_REST_API_TOKEN not provided — skipping monitor.");
    return 0;
  }

  const commandsUrl = KV_REST_API_URL.replace(/\/$/, "") + "/commands";

  async function upstashCommand(cmd) {
    try {
      const res = await fetch(commandsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${KV_REST_API_TOKEN}`,
        },
        body: JSON.stringify({ command: cmd }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "<no-body>");
        console.error("Upstash command failed:", res.status, txt);
        return null;
      }
      const j = await res.json().catch(() => null);
      return j?.result ?? null;
    } catch (err) {
      console.error("Upstash command error", err);
      return null;
    }
  }

  const badBotsLen = await upstashCommand(["LLEN", "bad-bots"]);
  const rateEventsLen = await upstashCommand(["LLEN", "rate-limit-events"]);

  const bad = Number(badBotsLen || 0);
  const rateE = Number(rateEventsLen || 0);

  console.log(`bad-bots=${bad} (threshold=${THRESHOLD_BAD_BOTS}), rate-limit-events=${rateE} (threshold=${THRESHOLD_RATE_LIMIT_EVENTS})`);

  if (bad < THRESHOLD_BAD_BOTS && rateE < THRESHOLD_RATE_LIMIT_EVENTS) {
    console.log("No thresholds exceeded.");
    return 0;
  }

  if (!GITHUB_REPOSITORY || !GITHUB_TOKEN) {
    console.error("GITHUB_REPOSITORY or GITHUB_TOKEN not provided; cannot create issue.");
    return 2;
  }

  const [owner, repo] = GITHUB_REPOSITORY.split("/");
  if (!owner || !repo) {
    console.error("GITHUB_REPOSITORY malformed:", GITHUB_REPOSITORY);
    return 2;
  }

  const prefix = "[auto] Rate-limit alert";
  const title = `${prefix}: ${bad} bad-bots, ${rateE} rate-limit-events`;
  const body = `Automated rate-limit monitor alert (generated ${new Date().toISOString()})\n\n- bad-bots: ${bad}\n- rate-limit-events: ${rateE}\n\nThresholds: bad-bots=${THRESHOLD_BAD_BOTS}, rate-limit-events=${THRESHOLD_RATE_LIMIT_EVENTS}\n\nThis issue was created automatically by the repository monitor.\n`;

  // Check for existing open auto-issue
  try {
    const issuesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json" },
    });
    if (issuesRes.ok) {
      const issues = await issuesRes.json();
      const existing = issues.find((i) => !i.pull_request && typeof i.title === "string" && i.title.startsWith(prefix));
      if (existing) {
        console.log("Found existing auto-issue #" + existing.number + ", adding comment.");
        const commentRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${existing.number}/comments`, {
          method: "POST",
          headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json" },
          body: JSON.stringify({ body }),
        });
        if (!commentRes.ok) {
          console.error("Failed to add comment to existing issue", commentRes.status);
          return 2;
        }
        console.log("Added comment to existing issue.");
        return 0;
      }
    } else {
      console.error("Failed to list issues", issuesRes.status);
    }
  } catch (err) {
    console.error("Error checking existing issues", err);
  }

  // Create a new issue
  try {
    const createRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: "POST",
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json" },
      body: JSON.stringify({ title, body }),
    });
    if (!createRes.ok) {
      const txt = await createRes.text().catch(() => "<no-body>");
      console.error("Failed to create issue", createRes.status, txt);
      return 2;
    }
    const created = await createRes.json();
    console.log("Created issue:", created.html_url);
    return 0;
  } catch (err) {
    console.error("Error creating issue", err);
    return 2;
  }
}

run().then((code) => process.exit(code)).catch((err) => {
  console.error(err);
  process.exit(1);
});
