import { promises as fs } from "fs";
import path from "path";
import { rpush, lrange, ltrim } from "@/lib/upstash";
import { normalizeUpstashList } from "@/lib/dsr-utils";

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

// use normalizeUpstashList from src/lib/dsr-utils for robust parsing

async function pushToUpstash(event: unknown) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return false;
  try {
    const pushed = await rpush(UPSTASH_KEY, [JSON.stringify(event)]);
    if (!pushed) {
      console.error("/api/consent upstash RPUSH failed: no response");
      return false;
    }

    // keep list bounded (last 10k)
    try {
      await ltrim(UPSTASH_KEY, 0, 9999);
    } catch (_) {}

    return true;
  } catch (err) {
    console.error("/api/consent upstash push error", err);
    return false;
  }
}

async function readFromUpstash(): Promise<unknown[] | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const arrRaw = await lrange(UPSTASH_KEY, 0, -1);
    const list = normalizeUpstashList(arrRaw);
    return list.map((s: unknown) => {
      if (typeof s === "string") {
        try {
          return JSON.parse(s as string) as unknown;
        } catch {
          return { raw: s };
        }
      }
      return s;
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

    // If this is a revoke action, clear common analytics cookies server-side.
    let responseHeaders: Headers | undefined = undefined;
    if (action === "revoke") {
      const cookieAttrs = "Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Lax";
      const toClear = ["_ga", "_gid", "_gcl_au", "g_state", "AMP_TOKEN", "shenoylabs_consent"];
      responseHeaders = new Headers();
      for (const n of toClear) {
        responseHeaders.append("Set-Cookie", `${n}=; ${cookieAttrs}`);
      }
    }

    // Try Upstash first (durable, serverless-friendly). If not configured/fails, fall back to local file (dev).
    const pushed = await pushToUpstash(event);
    if (pushed) {
      return new Response(JSON.stringify({ ok: true, store: "upstash" }), { status: 201, headers: responseHeaders });
    }

    // fallback to file
    await ensureDir();
    await fs.appendFile(LOG_FILE, JSON.stringify(event) + "\n", "utf8");

    return new Response(JSON.stringify({ ok: true, store: "file" }), { status: 201, headers: responseHeaders });
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
