import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const LOG_FILE = path.join(DATA_DIR, "consent-events.ndjson");

// Use KV-style REST env names (KV_REST_API_URL / KV_REST_API_TOKEN)
const UPSTASH_URL = process.env.KV_REST_API_URL ?? null;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_READ_ONLY_TOKEN ?? null;
const UPSTASH_KEY = process.env.UPSTASH_CONSENT_KEY || "consent_events";

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (_) {}
}

async function pushToUpstash(event: any) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return false;
  try {
    const res = await fetch(`${UPSTASH_URL}/commands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
      },
      body: JSON.stringify({ command: ["RPUSH", UPSTASH_KEY, JSON.stringify(event)] }),
    });

    if (!res.ok) {
      console.error("/api/consent upstash RPUSH failed:", await res.text());
      return false;
    }

    // keep list bounded (last 10k)
    try {
      await fetch(`${UPSTASH_URL}/commands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
        },
        body: JSON.stringify({ command: ["LTRIM", UPSTASH_KEY, "0", "9999"] }),
      });
    } catch (_) {}

    return true;
  } catch (err) {
    console.error("/api/consent upstash push error", err);
    return false;
  }
}

async function readFromUpstash(): Promise<any[] | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const res = await fetch(`${UPSTASH_URL}/commands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
      },
      body: JSON.stringify({ command: ["LRANGE", UPSTASH_KEY, "0", "-1"] }),
    });

    if (!res.ok) {
      console.error("/api/consent upstash LRANGE failed:", await res.text());
      return null;
    }

    const j = await res.json().catch(() => null);
    const arr = (j && Array.isArray(j.result)) ? j.result : [];
    return arr.map((s: string) => {
      try {
        return JSON.parse(s);
      } catch {
        return { raw: s };
      }
    });
  } catch (err) {
    console.error("/api/consent upstash read error", err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body?.action;
    const type = body?.type;

    if (!action || (action !== "grant" && action !== "revoke")) {
      return new Response(JSON.stringify({ error: "invalid action" }), { status: 400 });
    }
    if (!type) {
      return new Response(JSON.stringify({ error: "missing type" }), { status: 400 });
    }

    const event = {
      ts: new Date().toISOString(),
      action,
      type,
      subject: body?.subject ?? null,
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
      ua: req.headers.get("user-agent") || null,
      referer: req.headers.get("referer") || null,
    };

    // Try Upstash first (durable, serverless-friendly). If not configured/fails, fall back to local file (dev).
    const pushed = await pushToUpstash(event);
    if (pushed) {
      return new Response(JSON.stringify({ ok: true, store: "upstash" }), { status: 201 });
    }

    // fallback to file
    await ensureDir();
    await fs.appendFile(LOG_FILE, JSON.stringify(event) + "\n", "utf8");

    return new Response(JSON.stringify({ ok: true, store: "file" }), { status: 201 });
  } catch (err) {
    console.error("/api/consent POST error", err);
    return new Response(JSON.stringify({ error: "server error" }), { status: 500 });
  }
}

export async function GET(req: Request) {
  const adminKey = process.env.CONSENT_ADMIN_KEY;
  const provided = req.headers.get("x-consent-admin-key");
  if (!adminKey || provided !== adminKey) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  // Try reading from Upstash if available
  const fromUpstash = await readFromUpstash();
  if (fromUpstash) {
    return new Response(JSON.stringify({ events: fromUpstash }), { status: 200 });
  }

  try {
    const data = await fs.readFile(LOG_FILE, "utf8").catch(() => "");
    const lines = data
      .split(/\r?\n/)
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return { raw: l };
        }
      });

    return new Response(JSON.stringify({ events: lines }), { status: 200 });
  } catch (err) {
    console.error("/api/consent GET error", err);
    return new Response(JSON.stringify({ error: "server error" }), { status: 500 });
  }
}
