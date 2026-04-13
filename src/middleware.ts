import { NextRequest, NextResponse } from "next/server";
import { incr, setKey, rpush } from "./lib/upstash";

// Basic edge rate limiting and bot rules. This middleware runs at the edge
// (Vercel/Next.js Edge runtime) and applies to API routes (see matcher below).

const RATE_LIMIT_REQUESTS = Number(process.env.RATE_LIMIT_REQUESTS ?? 60);
const RATE_LIMIT_WINDOW_S = Number(process.env.RATE_LIMIT_WINDOW_S ?? 60);
const LOG_SAMPLE_RATE = Number(process.env.LOG_SAMPLE_RATE ?? 10);

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
