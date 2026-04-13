import { NextRequest, NextResponse } from "next/server";
import { incr, setKey, rpush } from "./lib/upstash";

// Basic edge rate limiting and bot rules. This middleware runs at the edge
// (Vercel/Next.js Edge runtime) and applies to API routes (see matcher below).

const RATE_LIMIT_REQUESTS = Number(process.env.RATE_LIMIT_REQUESTS ?? 60);
const RATE_LIMIT_WINDOW_S = Number(process.env.RATE_LIMIT_WINDOW_S ?? 60);
const LOG_SAMPLE_RATE = Number(process.env.LOG_SAMPLE_RATE ?? 10);
const COOKIE_SECRET = process.env.RATE_LIMIT_COOKIE_SECRET ?? null;
const COOKIE_NAME = process.env.RATE_LIMIT_COOKIE_NAME ?? "rbucket";

// Cached HMAC key for the cookie signer (avoid re-importing every request)
let _cachedHmacKey: CryptoKey | null = null;
let _cachedHmacSecret: string | null = null;

async function getHmacKey(secret: string) {
  if (_cachedHmacKey && _cachedHmacSecret === secret) return _cachedHmacKey;
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  // Web Crypto API import
  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
  _cachedHmacKey = key;
  _cachedHmacSecret = secret;
  return key;
}

function base64UrlEncode(bytes: Uint8Array) {
  // Prefer Buffer when available (Node), fall back to btoa
  let b64 = "";
  if (typeof Buffer !== "undefined") {
    b64 = Buffer.from(bytes).toString("base64");
  } else {
    let s = "";
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    b64 = typeof btoa !== "undefined" ? btoa(s) : "";
  }
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecodeToString(b64u: string) {
  const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/") + "==".slice((2 - b64u.length * 3) & 3);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(b64, "base64").toString("utf8");
  }
  const bin = typeof atob !== "undefined" ? atob(b64) : "";
  try {
    // decode UTF-8
    return decodeURIComponent(
      Array.prototype.map
        .call(bin, function (c: string) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
  } catch {
    return bin;
  }
}

async function signPayload(secret: string, payloadStr: string) {
  const key = await getHmacKey(secret);
  const enc = new TextEncoder();
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(payloadStr));
  return base64UrlEncode(new Uint8Array(sigBuf));
}

async function verifySignature(secret: string, payloadStr: string, sigB64u: string) {
  try {
    const key = await getHmacKey(secret);
    const enc = new TextEncoder();
    const sig = Uint8Array.from(atob ? atob(sigB64u.replace(/-/g, "+").replace(/_/g, "/")) : [], (c) => c.charCodeAt(0));
    // Use subtle.verify with reconstructed signature buffer
    const ok = await crypto.subtle.verify("HMAC", key, sig, enc.encode(payloadStr));
    return ok;
  } catch (e) {
    return false;
  }
}

function parseCookies(header: string | null) {
  const out: Record<string, string> = {};
  if (!header) return out;
  const parts = header.split(";");
  for (const p of parts) {
    const idx = p.indexOf("=");
    if (idx === -1) continue;
    const name = p.slice(0, idx).trim();
    const val = p.slice(idx + 1).trim();
    out[name] = val;
  }
  return out;
}

function getIpFromRequest(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

const BOT_PATTERNS = [
  "bot",
  "spider",
  "crawler",
  "curl",
  "wget",
  "python-requests",
  "httpclient",
  "scrapy",
];

export async function middleware(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;

    // Only protect API endpoints by default
    if (!pathname.startsWith("/api")) return NextResponse.next();

    const ua = (req.headers.get("user-agent") || "").toLowerCase();
    const ip = getIpFromRequest(req);

    // Basic bot detection: block obvious CLI/empty agents and known bad UA substrings
    if (!ua || BOT_PATTERNS.some((p) => ua.includes(p))) {
      // Sample logging: only push 1 in LOG_SAMPLE_RATE events to reduce write volume
      try {
        const shouldLog = LOG_SAMPLE_RATE <= 1 ? true : Math.random() < 1 / LOG_SAMPLE_RATE;
        if (shouldLog) await rpush("bad-bots", [{ ts: Date.now(), ip, ua, path: pathname }]);
      } catch (e) {
        // swallow logging errors
      }
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Cookie token-bucket (stateless) — preferred no-cost enforcement when cookie secret is set
    if (COOKIE_SECRET) {
      try {
        const cookieHeader = req.headers.get("cookie") || null;
        const cookies = parseCookies(cookieHeader);
        const raw = cookies[COOKIE_NAME] ?? null;
        const now = Date.now();
        const capacity = RATE_LIMIT_REQUESTS;
        const windowS = RATE_LIMIT_WINDOW_S;

        let tokens = capacity;
        let last = now;

        if (raw) {
          const parts = raw.split(".");
          if (parts.length === 2) {
            const payloadB64 = parts[0];
            const sig = parts[1];
            const payloadStr = base64UrlDecodeToString(payloadB64);
            const ok = await verifySignature(COOKIE_SECRET, payloadStr, sig).catch(() => false);
            if (ok) {
              try {
                const parsed = JSON.parse(payloadStr) as { t?: number; l?: number };
                tokens = typeof parsed.t === "number" ? parsed.t : capacity;
                last = typeof parsed.l === "number" ? parsed.l : now;
              } catch {
                tokens = capacity;
                last = now;
              }
            }
          }
        }

        // Refill tokens based on elapsed time
        const elapsedS = Math.max(0, (now - last) / 1000);
        const rate = capacity / windowS; // tokens per second
        let newTokens = Math.min(capacity, tokens + elapsedS * rate);

        if (newTokens >= 1) {
          newTokens = newTokens - 1;
          const payloadStr = JSON.stringify({ t: newTokens, l: now });
          const payloadB64u = base64UrlEncode(new TextEncoder().encode(payloadStr));
          const sigB64u = await signPayload(COOKIE_SECRET, payloadStr);
          const cookieVal = `${payloadB64u}.${sigB64u}`;
          const res = NextResponse.next();
          try {
            res.cookies.set(COOKIE_NAME, cookieVal, {
              httpOnly: true,
              path: "/",
              secure: true,
              sameSite: "lax",
              maxAge: windowS,
            });
          } catch {
            // ignore cookie set failures
          }
          return res;
        }

        // Exceeded token bucket
        try {
          const payloadStr = JSON.stringify({ t: 0, l: now });
          const payloadB64u = base64UrlEncode(new TextEncoder().encode(payloadStr));
          const sigB64u = await signPayload(COOKIE_SECRET, payloadStr);
          const cookieVal = `${payloadB64u}.${sigB64u}`;
          const resp = new NextResponse("Too Many Requests", { status: 429 });
          try {
            resp.cookies.set(COOKIE_NAME, cookieVal, {
              httpOnly: true,
              path: "/",
              secure: true,
              sameSite: "lax",
              maxAge: windowS,
            });
          } catch {
            // ignore
          }
          return resp;
        } catch (e) {
          return new NextResponse("Too Many Requests", { status: 429 });
        }
      } catch (e) {
        // If cookie/token logic fails, fall through to Upstash path
        console.error("token-bucket cookie error", e);
      }
    }

    // Rate limiting per IP
    const key = `rl:${ip}`;

    // Use Upstash INCR for atomic increments. Only set the TTL when the key
    // is first created (count === 1) to avoid an extra write on every request.
    // This reduces Upstash write volume while keeping accurate counters.
    let count: number | null = null;
    try {
      const incResult = await incr(key);
      // Upstash often returns numbers as strings; normalize
      count = incResult === null ? null : Number(incResult);
      // Set TTL only when counter is first created to avoid repeated writes
      if (count !== null && count === 1) {
        try {
          await setKey(key, String(count), RATE_LIMIT_WINDOW_S * 1000);
        } catch (e) {
          // ignore TTL set failures
        }
      }
    } catch (err) {
      // If Upstash fails, allow the request rather than risk blocking legitimate traffic
      console.error("rate-limit: upstash error", err);
      return NextResponse.next();
    }

    if (count !== null && count > RATE_LIMIT_REQUESTS) {
      // Log rate-limit events sparsely: log the first exceed and then 1-in-N samples
      try {
        const firstExceed = count === RATE_LIMIT_REQUESTS + 1;
        const sampled = LOG_SAMPLE_RATE <= 1 ? true : count % LOG_SAMPLE_RATE === 0;
        if (firstExceed || sampled) {
          await rpush("rate-limit-events", [{ ts: Date.now(), ip, ua, path: pathname, count }]);
        }
      } catch (e) {
        // swallow logging errors
      }
      return new NextResponse("Too Many Requests", { status: 429 });
    }

    return NextResponse.next();
  } catch (err) {
    // Fail-open: don't block requests if middleware throws unexpectedly
    console.error("middleware error", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
