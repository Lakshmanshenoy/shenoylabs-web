import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const LOG_FILE = path.join(DATA_DIR, "consent-events.ndjson");

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const UPSTASH_KEY = process.env.UPSTASH_CONSENT_KEY || "consent_events";
const ADMIN_KEY = process.env.CONSENT_ADMIN_KEY;

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (_) {}
}

async function upstashCmd(command: string[]) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const res = await fetch(`${UPSTASH_URL}/commands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
      },
      body: JSON.stringify({ command }),
    });

    if (!res.ok) {
      try {
        const text = await res.text();
        console.error("/api/dsr upstash command failed:", text);
      } catch (_) {}
      return null;
    }

    const j = await res.json().catch(() => null);
    return j?.result ?? null;
  } catch (err) {
    console.error("/api/dsr upstash error", err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const provided = req.headers.get("x-consent-admin-key");
    if (!ADMIN_KEY || provided !== ADMIN_KEY) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const subject = body?.subject ?? null;

    if (!action) {
      return new Response(JSON.stringify({ error: "missing action" }), { status: 400 });
    }

    if (action === "export") {
      let events: any[] = [];

      if (UPSTASH_URL && UPSTASH_TOKEN) {
        const arr = (await upstashCmd(["LRANGE", UPSTASH_KEY, "0", "-1"])) || [];
        events = Array.isArray(arr)
          ? arr.map((s: string) => {
              try {
                return JSON.parse(s);
              } catch {
                return { raw: s };
              }
            })
          : [];
      } else {
        const data = await fs.readFile(LOG_FILE, "utf8").catch(() => "");
        events = data
          .split(/\r?\n/)
          .filter(Boolean)
          .map((l) => {
            try {
              return JSON.parse(l);
            } catch {
              return { raw: l };
            }
          });
      }

      const filtered = subject ? events.filter((e) => e && e.subject === subject) : events;
      return new Response(JSON.stringify({ events: filtered }), { status: 200 });
    }

    if (action === "delete") {
      if (!subject) return new Response(JSON.stringify({ error: "missing subject" }), { status: 400 });

      if (UPSTASH_URL && UPSTASH_TOKEN) {
        const arr = (await upstashCmd(["LRANGE", UPSTASH_KEY, "0", "-1"])) || [];
        const parsed = Array.isArray(arr)
          ? arr.map((s: string) => {
              try {
                return JSON.parse(s);
              } catch {
                return s;
              }
            })
          : [];

        const remaining = parsed.filter((e) => !(e && e.subject === subject));
        const deleted = parsed.length - remaining.length;

        if (deleted === 0) {
          return new Response(JSON.stringify({ ok: true, deleted: 0 }), { status: 200 });
        }

        await upstashCmd(["DEL", UPSTASH_KEY]);
        if (remaining.length > 0) {
          const pushCmd = ["RPUSH", UPSTASH_KEY, ...remaining.map((r) => JSON.stringify(r))];
          await upstashCmd(pushCmd);
          await upstashCmd(["LTRIM", UPSTASH_KEY, "0", "9999"]);
        }

        return new Response(JSON.stringify({ ok: true, deleted }), { status: 200 });
      }

      await ensureDir();
      const data = await fs.readFile(LOG_FILE, "utf8").catch(() => "");
      const lines = data.split(/\r?\n/).filter(Boolean);
      const parsed = lines.map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      });

      const remaining = parsed.filter((e) => !(e && e.subject === subject));
      const deleted = parsed.length - remaining.length;

      await fs.writeFile(LOG_FILE, remaining.map((r) => JSON.stringify(r)).join("\n") + (remaining.length ? "\n" : ""), "utf8");

      return new Response(JSON.stringify({ ok: true, deleted }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "invalid action" }), { status: 400 });
  } catch (err) {
    console.error("/api/dsr POST error", err);
    return new Response(JSON.stringify({ error: "server error" }), { status: 500 });
  }
}
