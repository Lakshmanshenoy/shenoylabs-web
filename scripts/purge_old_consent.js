#!/usr/bin/env node
/*
  Purge consent events older than the configured retention window.
  Supports Upstash (KV REST) if `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set,
  otherwise operates on the local fallback file `data/consent-events.ndjson`.

  Usage:
    CONSENT_RETENTION_DAYS=365 node scripts/purge_old_consent.js

  WARNING: This script modifies storage. Run locally and review before scheduling.
*/

import fs from "fs";
import path from "path";

const UPSTASH_URL = process.env.KV_REST_API_URL ?? null;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_READ_ONLY_TOKEN ?? null;
const UPSTASH_KEY = process.env.UPSTASH_CONSENT_KEY ?? "consent_events";
const DATA_FILE = path.join(process.cwd(), "data", "consent-events.ndjson");

const retentionDays = Number(process.env.CONSENT_RETENTION_DAYS ?? process.env.CONSENT_RETENTION_DAYS_OVERRIDE ?? 1825);
const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

function now() {
  return Date.now();
}

async function fetchUpstashList() {
  const url = `${UPSTASH_URL}/lrange/${encodeURIComponent(UPSTASH_KEY)}/0/-1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } });
  if (!res.ok) throw new Error(`Upstash LRANGE failed: ${res.status}`);
  const j = await res.json();
  return j?.result ?? [];
}

async function deleteUpstashKey() {
  const url = `${UPSTASH_URL}/del/${encodeURIComponent(UPSTASH_KEY)}`;
  const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } });
  return res.ok;
}

async function rpushUpstash(values) {
  const url = `${UPSTASH_URL}/rpush/${encodeURIComponent(UPSTASH_KEY)}`;
  const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(values) });
  return res.ok;
}

function parseEvent(v) {
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return { raw: v };
    }
  }
  return v;
}

async function runUpstash() {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    console.log("Upstash not configured — skipping Upstash branch");
    return false;
  }

  console.log("Fetching Upstash list...");
  const arr = await fetchUpstashList();
  const nowTs = now();
  const remaining = [];
  let deleted = 0;

  for (const item of arr) {
    const parsed = parseEvent(item);
    const ts = parsed && parsed.ts ? Date.parse(parsed.ts) : NaN;
    if (!Number.isNaN(ts) && nowTs - ts > retentionMs) {
      deleted++;
      continue;
    }
    remaining.push(typeof item === "string" ? item : JSON.stringify(item));
  }

  if (deleted === 0) {
    console.log("No Upstash consent events to delete.");
    return true;
  }

  console.log(`Deleting ${deleted} old consent events from Upstash (replacing list)...`);
  await deleteUpstashKey();
  if (remaining.length > 0) {
    await rpushUpstash(remaining);
  }
  console.log("Upstash purge completed.");
  return true;
}

async function runFileFallback() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      console.log("No local consent file found; nothing to do.");
      return true;
    }

    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const nowTs = now();
    const remaining = [];
    let deleted = 0;

    for (const l of lines) {
      let parsed;
      try {
        parsed = JSON.parse(l);
      } catch {
        // preserve lines we cannot parse
        remaining.push(l);
        continue;
      }

      const ts = parsed && parsed.ts ? Date.parse(parsed.ts) : NaN;
      if (!Number.isNaN(ts) && nowTs - ts > retentionMs) {
        deleted++;
        continue;
      }
      remaining.push(JSON.stringify(parsed));
    }

    if (deleted === 0) {
      console.log("No local consent events to delete.");
      return true;
    }

    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, remaining.join("\n") + (remaining.length ? "\n" : ""), "utf8");
    console.log(`Deleted ${deleted} entries from local consent file.`);
    return true;
  } catch (err) {
    console.error("File fallback purge failed:", err);
    return false;
  }
}

async function main() {
  console.log(`Purge consent script starting — retentionDays=${retentionDays}`);
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const ok = await runUpstash();
      if (ok) process.exit(0);
    } catch (err) {
      console.error("Upstash purge failed, will try file fallback:", err);
    }
  }

  const fileOk = await runFileFallback();
  if (!fileOk) process.exit(2);
  process.exit(0);
}

main();
