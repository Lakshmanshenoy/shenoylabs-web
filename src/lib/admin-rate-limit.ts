import { incr, setKey } from "./upstash";

const ADMIN_RATE_LIMIT = Number(process.env.ADMIN_RATE_LIMIT ?? 30);
const ADMIN_RATE_WINDOW_MS = Number(process.env.ADMIN_RATE_WINDOW_MS ?? 60_000);

// In-memory fallback when Upstash isn't configured. Map key -> { count, reset }
const _inMemory = new Map<string, { count: number; reset: number }>();

export async function checkAdminRateLimit(req: Request) {
  const headerKey = req.headers.get("x-admin-key") ?? req.headers.get("x-consent-admin-key") ?? "";
  if (!headerKey) return null;

  const upstashKey = `rl:admin:${headerKey}`;

  // Try Upstash first (atomic INCR)
  try {
    const inc = await incr(upstashKey);
    const count = inc === null ? null : Number(inc);
    if (!Number.isNaN(count) && count !== null) {
      if (count === 1) {
        try {
          await setKey(upstashKey, String(count), ADMIN_RATE_WINDOW_MS);
        } catch (e) {
          // ignore TTL set failures
        }
      }
      if (count > ADMIN_RATE_LIMIT) {
        const retryAfter = Math.ceil(ADMIN_RATE_WINDOW_MS / 1000);
        return new Response(
          JSON.stringify({ error: "rate_limited", message: `Too many requests (admin): ${ADMIN_RATE_LIMIT} per ${ADMIN_RATE_WINDOW_MS / 1000}s` }),
          { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) } }
        );
      }
      return null;
    }
  } catch (err) {
    console.error("adminRateLimit upstash error", err);
  }

  // Fallback in-memory token window
  try {
    const now = Date.now();
    const existing = _inMemory.get(upstashKey) ?? { count: 0, reset: now + ADMIN_RATE_WINDOW_MS };
    if (now > existing.reset) {
      existing.count = 0;
      existing.reset = now + ADMIN_RATE_WINDOW_MS;
    }
    existing.count += 1;
    _inMemory.set(upstashKey, existing);
    if (existing.count > ADMIN_RATE_LIMIT) {
      const retryAfter = Math.ceil((existing.reset - now) / 1000);
      return new Response(
        JSON.stringify({ error: "rate_limited", message: `Too many requests (admin): ${ADMIN_RATE_LIMIT} per ${ADMIN_RATE_WINDOW_MS / 1000}s` }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) } }
      );
    }
  } catch (err) {
    console.error("adminRateLimit memory fallback error", err);
  }

  return null;
}

export default { checkAdminRateLimit };
