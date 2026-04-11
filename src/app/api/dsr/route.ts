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
  } catch {}
}
import { normalizeUpstashList, deepUnwrapValue, parseForExport, parseForDelete } from "../../../lib/dsr-utils";

export { normalizeUpstashList, deepUnwrapValue, parseForExport, parseForDelete };

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
      let events: Array<Record<string, unknown> | { raw: unknown }> = [];
      let arrRaw: unknown = null;

      if (UPSTASH_URL && UPSTASH_TOKEN) {
        arrRaw = await upstashCmd(["LRANGE", UPSTASH_KEY, "0", "-1"]);
        events = parseForExport(arrRaw);

        // If a subject filter was provided but nothing matched, try a tolerant
        // fallback: collect all string blobs from any nested shape and look for
        // ones that contain the subject, then parse them.
        if (subject && Array.isArray(events) && events.length === 0) {
          const collected: string[] = [];
          const collectStrings = (v: unknown) => {
            if (v == null) return;
            if (typeof v === "string") {
              collected.push(v);
            } else if (Array.isArray(v)) {
              for (const it of v) collectStrings(it);
            } else if (typeof v === "object" && v !== null) {
              // sometimes elements may be objects with nested string values
              const rec = v as Record<string, unknown>;
              for (const k of Object.keys(rec)) collectStrings(rec[k]);
            }
          };

          collectStrings(arrRaw);

          const matches = collected
            .filter((s) => s.includes(subject))
            .map((s) => {
              try {
                return JSON.parse(s) as Record<string, unknown>;
              } catch {
                return { raw: s } as { raw: unknown };
              }
            });

          if (matches.length > 0) events = matches;
        }
      } else {
        const data = await fs.readFile(LOG_FILE, "utf8").catch(() => "");
        const lines = data.split(/\r?\n/).filter(Boolean);
        arrRaw = lines;
        events = lines.map((l: string) => {
          try {
            return JSON.parse(l) as Record<string, unknown>;
          } catch {
            return { raw: l } as { raw: unknown };
          }
        });
      }

      const filtered = subject
        ? events.filter((e) => {
            if (typeof e === "object" && e !== null && "subject" in e) {
              const rec = e as Record<string, unknown>;
              return String(rec.subject) === subject;
            }
            return false;
          })
        : events;

      return new Response(JSON.stringify({ events: filtered }), { status: 200 });
    }

    if (action === "delete") {
      if (!subject) return new Response(JSON.stringify({ error: "missing subject" }), { status: 400 });

      if (UPSTASH_URL && UPSTASH_TOKEN) {
        const arrRaw = await upstashCmd(["LRANGE", UPSTASH_KEY, "0", "-1"]);
        const list = normalizeUpstashList(arrRaw);

        const remainingRaw: string[] = [];
        let deleted = 0;

        for (const rawItem of list) {
          const parsedItem = deepUnwrapValue(rawItem);
          let candidate: unknown = parsedItem;
          if (Array.isArray(candidate) && candidate.length === 1) candidate = candidate[0];

          if (candidate && typeof candidate === "object" && candidate !== null) {
            const rec = candidate as Record<string, unknown>;
            if (rec.subject === subject) {
              deleted++;
              continue;
            }
          }

          // preserve original stored representation when re-pushing
          if (typeof rawItem === "string") remainingRaw.push(rawItem);
          else {
            try {
              remainingRaw.push(JSON.stringify(rawItem));
            } catch {
              remainingRaw.push(String(rawItem));
            }
          }
        }

        if (deleted === 0) {
          return new Response(JSON.stringify({ ok: true, deleted: 0 }), { status: 200 });
        }

        await upstashCmd(["DEL", UPSTASH_KEY]);
        if (remainingRaw.length > 0) {
          const pushCmd = ["RPUSH", UPSTASH_KEY, ...remainingRaw];
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
