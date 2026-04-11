import { promises as fs } from "fs";
import path from "path";
import { lrange, delKey, rpush, ltrim, getKey, setKey } from "@/lib/upstash";

const DATA_DIR = path.join(process.cwd(), "data");
const LOG_FILE = path.join(DATA_DIR, "consent-events.ndjson");

// Use KV-style REST env names (KV_REST_API_URL / KV_REST_API_TOKEN)
const UPSTASH_URL = process.env.KV_REST_API_URL ?? null;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_READ_ONLY_TOKEN ?? null;
const UPSTASH_KEY = process.env.UPSTASH_CONSENT_KEY || "consent_events";
const ADMIN_KEY = process.env.CONSENT_ADMIN_KEY;

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (_) {}
}

function normalizeUpstashList(arr: any): any[] {
  if (!arr) return [];

  // Unwrap { result: [...] } responses
  if (typeof arr === "object" && !Array.isArray(arr) && "result" in arr && Array.isArray((arr as any).result)) {
    arr = (arr as any).result;
  }

  // If the whole payload is a JSON-encoded array/string, try to parse it
  if (typeof arr === "string") {
    try {
      const parsed = JSON.parse(arr);
      // If parsing yields an array or primitive, use it
      arr = parsed;
    } catch {
      // leave as a raw string
      return [arr];
    }
  }

  // Flatten any nested arrays to a single-level list of items
  if (Array.isArray(arr)) {
    try {
      // depth Infinity to be defensive against nested wrappers
      arr = (arr as any[]).flat(Infinity);
    } catch {
      // fallback to shallow flatten
      arr = (arr as any[]).flat();
    }
  }

  return Array.isArray(arr) ? arr : [];
}

function parseForExport(arr: any): any[] {
  const list = normalizeUpstashList(arr);
  return list.map((el: any) => {
    // If element is a JSON string, parse into object; otherwise return as-is
    if (typeof el === "string") {
      try {
        return JSON.parse(el);
      } catch {
        return { raw: el };
      }
    }
    return el;
  });
}

function parseForDelete(arr: any): any[] {
  const list = normalizeUpstashList(arr);
  return list.map((el: any) => {
    // For deletion we prefer the original stored representation (string) so we
    // return the raw string when parsing fails, otherwise the parsed object.
    if (typeof el === "string") {
      try {
        return JSON.parse(el);
      } catch {
        return el;
      }
    }
    return el;
  });
}

async function upstashCmd(command: string[]) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  const cmd = (command[0] ?? "").toString().toUpperCase();
  try {
    switch (cmd) {
      case "LRANGE":
        return await lrange(command[1], command[2], command[3]);
      case "RPUSH":
        return await rpush(command[1], command.slice(2));
      case "LTRIM":
        return await ltrim(command[1], command[2], command[3]);
      case "DEL":
        return await delKey(command[1]);
      case "GET":
        return await getKey(command[1]);
      case "SET": {
        const key = command[1];
        const value = command[2];
        let px: number | undefined;
        for (let i = 3; i < command.length; i++) {
          if (String(command[i]).toUpperCase() === "PX") {
            px = Number(command[i + 1]) || undefined;
            break;
          }
        }
        return await setKey(key, value, px);
      }
      default:
        // fallback to /commands if an unmapped command is used
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
            const text = await res.text().catch(() => "<no-body>");
            console.error("/api/dsr upstash command failed:", text);
            return null;
          }
          const j = await res.json().catch(() => null);
          return j?.result ?? null;
        } catch (err) {
          console.error("/api/dsr upstash error", err);
          return null;
        }
    }
  } catch (err) {
    console.error("/api/dsr upstash mapped error", err);
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
        const arrRaw = await upstashCmd(["LRANGE", UPSTASH_KEY, "0", "-1"]);
        events = parseForExport(arrRaw);
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
        const arrRaw = await upstashCmd(["LRANGE", UPSTASH_KEY, "0", "-1"]);
        const parsed = parseForDelete(arrRaw);

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
