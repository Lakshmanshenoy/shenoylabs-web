import { NextRequest, NextResponse } from "next/server";
import { incr, setKey, rpush } from "./lib/upstash";

// Basic edge rate limiting and bot rules. This middleware runs at the edge
// (Vercel/Next.js Edge runtime) and applies to API routes (see matcher below).

const RATE_LIMIT_REQUESTS = Number(process.env.RATE_LIMIT_REQUESTS ?? 60);
const RATE_LIMIT_WINDOW_S = Number(process.env.RATE_LIMIT_WINDOW_S ?? 60);

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
      // Log the event (non-blocking)
      try {
        await rpush("bad-bots", [{ ts: Date.now(), ip, ua, path: pathname }]);
      } catch (e) {
        // swallow logging errors
      }
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Rate limiting per IP
    const key = `rl:${ip}`;

    // Use Upstash INCR for atomic increments (if available) and then ensure TTL
    let count: number | null = null;
    try {
      const incResult = await incr(key);
      // Upstash often returns numbers as strings; normalize
      count = incResult === null ? null : Number(incResult);
      // Set TTL (overwrite with same numeric value but set px to window)
      if (count !== null) await setKey(key, String(count), RATE_LIMIT_WINDOW_S * 1000);
    } catch (err) {
      // If Upstash fails, allow the request rather than risk blocking legitimate traffic
      console.error("rate-limit: upstash error", err);
      return NextResponse.next();
    }

    if (count !== null && count > RATE_LIMIT_REQUESTS) {
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
