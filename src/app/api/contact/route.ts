import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";

import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

type ContactRequestBody = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  captchaToken?: unknown;
  website?: unknown;
  submittedAt?: unknown;
};

type ContactResponseBody = {
  ok: boolean;
  message: string;
  fallbackToEmail?: boolean;
};

type TurnstileVerificationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      status: number;
      message: string;
      fallbackToEmail?: boolean;
    };

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const limiter = new Map<string, number>();
const verifiedTurnstileTokens = new Map<string, number>();
// Use KV-style REST env names (KV_REST_API_URL / KV_REST_API_TOKEN)
const UPSTASH_URL = process.env.KV_REST_API_URL ?? null;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_READ_ONLY_TOKEN ?? null;
const RATE_LIMIT_WINDOW_MS = 45_000;
const TURNSTILE_TOKEN_WINDOW_MS = 5 * 60 * 1000;
const TURNSTILE_EXPECTED_ACTION = "contact_form";
const TURNSTILE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

type TurnstileVerifyResponse = {
  success: boolean;
  action?: string;
  challenge_ts?: string;
  "error-codes"?: string[];
  hostname?: string;
};

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getClientIpFromHeaders(headerStore: Headers) {
  const forwardedFor = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  if (realIp) return realIp;
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0];
    if (first) return first.trim();
  }
  return "unknown";
}

function getTrustedHosts(headerStore: Headers) {
  const trustedHosts = new Set<string>();

  const configuredHost = (() => {
    try {
      return new URL(siteConfig.url).host;
    } catch {
      return null;
    }
  })();

  if (configuredHost) trustedHosts.add(configuredHost);

  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = headerStore.get("host");

  if (forwardedHost) trustedHosts.add(forwardedHost.trim());
  if (host) trustedHosts.add(host.trim());

  // Also add port-stripped versions so "localhost" matches "localhost:3000".
  for (const h of [...trustedHosts]) {
    const withoutPort = h.split(":")[0];
    if (withoutPort && withoutPort !== h) {
      trustedHosts.add(withoutPort);
    }
  }

  return trustedHosts;
}

function hostFromUrl(value: string | null) {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

function isLocalHostname(hostname: string | null) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
}

function shouldUseTurnstileTestKeys(trustedHosts: Set<string>) {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  return Array.from(trustedHosts).some((host) => isLocalHostname(host.split(":")[0] ?? null));
}

function isAllowedRequestSource(headerStore: Headers) {
  const trustedHosts = getTrustedHosts(headerStore);
  const originHost = hostFromUrl(headerStore.get("origin"));
  const refererHost = hostFromUrl(headerStore.get("referer"));
  const fetchSite = headerStore.get("sec-fetch-site");

  if (fetchSite === "cross-site") return false;
  if (originHost) return trustedHosts.has(originHost);
  if (refererHost) return trustedHosts.has(refererHost);

  // Some non-browser clients omit origin metadata entirely. We allow those
  // requests so same-origin server actions and local tooling keep working.
  return true;
}

async function rateLimited(key: string) {
  const now = Date.now();

  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const prev = await upstashCmd(["GET", `rl:${key}`]);
      if (prev != null) {
        const prevTs = Number(prev);
        if (!Number.isNaN(prevTs) && now - prevTs < RATE_LIMIT_WINDOW_MS) {
          return true;
        }
      }
      await upstashCmd(["SET", `rl:${key}`, String(now), "PX", String(RATE_LIMIT_WINDOW_MS)]);
      return false;
    } catch (_) {
      // fallthrough to in-memory
    }
  }

  const last = limiter.get(key) ?? 0;
  if (now - last < RATE_LIMIT_WINDOW_MS) return true;
  limiter.set(key, now);

  if (limiter.size > 1000) {
    for (const [ip, timestamp] of limiter.entries()) {
      if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
        limiter.delete(ip);
      }
    }
  }

  return false;
}

function pruneExpiredEntries(store: Map<string, number>, windowMs: number, now: number) {
  for (const [key, timestamp] of store.entries()) {
    if (now - timestamp > windowMs) {
      store.delete(key);
    }
  }
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
        console.error("upstash command failed:", text);
      } catch (_) {}
      return null;
    }

    const j = await res.json().catch(() => null);
    return j?.result ?? null;
  } catch (err) {
    console.error("upstash command error", err);
    return null;
  }
}

function hashTurnstileToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function markTurnstileTokenAsUsed(token: string, timestamp = Date.now()) {
  (async () => {
    const hashed = hashTurnstileToken(token);
    if (UPSTASH_URL && UPSTASH_TOKEN) {
      try {
        await upstashCmd(["SET", `turnstile:${hashed}`, "1", "PX", String(TURNSTILE_TOKEN_WINDOW_MS)]);
        return;
      } catch (_) {
        // fall through to in-memory
      }
    }

    verifiedTurnstileTokens.set(hashed, timestamp);

    if (verifiedTurnstileTokens.size > 1000) {
      pruneExpiredEntries(verifiedTurnstileTokens, TURNSTILE_TOKEN_WINDOW_MS, timestamp);
    }
  })();
}

async function hasSeenTurnstileToken(token: string, now = Date.now()) {
  const hashed = hashTurnstileToken(token);
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const res = await upstashCmd(["GET", `turnstile:${hashed}`]);
      if (res != null) return true;
      return false;
    } catch (_) {
      // fall back to memory
    }
  }

  pruneExpiredEntries(verifiedTurnstileTokens, TURNSTILE_TOKEN_WINDOW_MS, now);
  return verifiedTurnstileTokens.has(hashed);
}

function logContactSecurityEvent(event: string, details: Record<string, unknown>) {
  console.warn(
    JSON.stringify({
      scope: "contact-form",
      event,
      ...details,
    }),
  );
}

function verificationFallbackResult(message: string): TurnstileVerificationResult {
  return {
    ok: false,
    status: 200,
    message,
    fallbackToEmail: true,
  };
}

function getVerificationFallbackMessage() {
  return `Verification is temporarily unavailable. Please email ${siteConfig.contactEmail} directly.`;
}

async function verifyTurnstileToken(token: string, ip: string, trustedHosts: Set<string>) {
  const useTestKeys = shouldUseTurnstileTestKeys(trustedHosts);
  const secret = useTestKeys ? TURNSTILE_TEST_SECRET_KEY : process.env.TURNSTILE_SECRET_KEY;
  const now = Date.now();

  if (!secret) {
    logContactSecurityEvent("turnstile_missing_secret", {
      ip,
    });
    return verificationFallbackResult(getVerificationFallbackMessage());
  }

  if (token.length > 2048) {
    return {
      ok: false,
      status: 400,
      message: "Verification failed. Please retry.",
    } as const;
  }

  if (!useTestKeys && (await hasSeenTurnstileToken(token, now))) {
    logContactSecurityEvent("turnstile_replay_blocked", {
      ip,
      reason: "local-replay-cache",
    });
    return {
      ok: false,
      status: 400,
      message: "Verification expired. Please try again.",
    } as const;
  }

  try {
    const formData = new URLSearchParams();
    formData.set("secret", secret);
    formData.set("response", token);
    formData.set("idempotency_key", randomUUID());
    if (ip && ip !== "unknown") {
      formData.set("remoteip", ip);
    }

    const verifyResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
      signal: AbortSignal.timeout(8_000),
    });

    if (!verifyResponse.ok) {
      logContactSecurityEvent("turnstile_provider_unavailable", {
        ip,
        status: verifyResponse.status,
      });
      return verificationFallbackResult(getVerificationFallbackMessage());
    }

    const verification = (await verifyResponse.json()) as TurnstileVerifyResponse;
    if (!verification.success) {
      const errorCodes = verification["error-codes"] ?? [];
      logContactSecurityEvent("turnstile_verification_failed", {
        ip,
        errorCodes,
      });

      return {
        ok: false,
        status:
          errorCodes.includes("invalid-input-secret") ||
          errorCodes.includes("missing-input-secret") ||
          errorCodes.includes("internal-error")
            ? 200
            : 400,
        fallbackToEmail:
          errorCodes.includes("invalid-input-secret") ||
          errorCodes.includes("missing-input-secret") ||
          errorCodes.includes("internal-error"),
        message: errorCodes.includes("timeout-or-duplicate")
          ? "Verification expired. Please try again."
          : errorCodes.includes("invalid-input-secret") ||
              errorCodes.includes("missing-input-secret") ||
              errorCodes.includes("internal-error")
            ? getVerificationFallbackMessage()
          : "Verification failed. Please retry and submit again.",
      } as const;
    }

    if (!useTestKeys && verification.action !== TURNSTILE_EXPECTED_ACTION) {
      logContactSecurityEvent("turnstile_action_mismatch", {
        ip,
        expectedAction: TURNSTILE_EXPECTED_ACTION,
        receivedAction: verification.action ?? null,
      });
      return {
        ok: false,
        status: 400,
        message: "Verification failed. Please retry.",
      } as const;
    }

    if (verification.hostname && !trustedHosts.has(verification.hostname)) {
      logContactSecurityEvent("turnstile_hostname_mismatch", {
        ip,
        hostname: verification.hostname,
        trustedHosts: Array.from(trustedHosts),
      });
      return {
        ok: false,
        status: 400,
        message: "Verification failed. Please retry.",
      } as const;
    }

    if (!useTestKeys) {
      markTurnstileTokenAsUsed(token, now);
    }

    return { ok: true } as const;
  } catch {
    logContactSecurityEvent("turnstile_verification_error", {
      ip,
      reason: "network-or-timeout",
    });
    return verificationFallbackResult(getVerificationFallbackMessage());
  }
}

export async function POST(request: Request) {
  try {
    const raw = (await request.json()) as ContactRequestBody;

    const name = asText(raw.name);
    const email = asText(raw.email);
    const subject = asText(raw.subject);
    const message = asText(raw.message);
    const captchaToken = asText(raw.captchaToken);
    const website = asText(raw.website);
    const submittedAt = typeof raw.submittedAt === "number" ? raw.submittedAt : 0;

    // Basic anti-spam: hidden field and unrealistically fast submit windows.
    if (website) {
      const response: ContactResponseBody = { ok: true, message: "Message received." };
      return Response.json(
        response,
        { status: 200 },
      );
    }
    if (!submittedAt || Date.now() - submittedAt < 1200) {
      const response: ContactResponseBody = {
        ok: false,
        message: "Please wait a moment before submitting.",
      };
      return Response.json(
        response,
        { status: 400 },
      );
    }

    if (
      name.length < 2 ||
      name.length > 80 ||
      !emailRegex.test(email) ||
      subject.length < 3 ||
      subject.length > 140 ||
      message.length < 20 ||
      message.length > 4000
    ) {
      const response: ContactResponseBody = {
        ok: false,
        message: "Please check your input and try again.",
      };
      return Response.json(
        response,
        { status: 400 },
      );
    }

    const requestHeaders = await headers();
    const trustedHosts = getTrustedHosts(requestHeaders);
    if (!isAllowedRequestSource(requestHeaders)) {
      const response: ContactResponseBody = {
        ok: false,
        message: "Cross-site submissions are not allowed.",
      };
      return Response.json(
        response,
        { status: 403 },
      );
    }

    const ip = getClientIpFromHeaders(requestHeaders);
    if (await rateLimited(ip)) {
      const response: ContactResponseBody = {
        ok: false,
        message: "Too many attempts. Please retry shortly.",
      };
      return Response.json(
        response,
        { status: 429 },
      );
    }

    if (!captchaToken) {
      const response: ContactResponseBody = {
        ok: false,
        message: "Verification token is missing. Please complete verification.",
      };
      return Response.json(
        response,
        { status: 400 },
      );
    }

    const turnstileVerification = await verifyTurnstileToken(captchaToken, ip, trustedHosts);
    if (!turnstileVerification.ok) {
      const response: ContactResponseBody = {
        ok: false,
        message: turnstileVerification.message,
        fallbackToEmail: turnstileVerification.fallbackToEmail,
      };
      return Response.json(
        response,
        { status: turnstileVerification.status },
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL || siteConfig.contactEmail;
    const fromEmail = process.env.CONTACT_FROM_EMAIL;

    if (!resendApiKey || !fromEmail) {
      const response: ContactResponseBody = {
        ok: false,
        message:
          `Contact form delivery is not configured yet. Please email ${siteConfig.contactEmail} directly.`,
        fallbackToEmail: true,
      };
      return Response.json(
        response,
        { status: 200 },
      );
    }

    const subjectLine = `New contact request: ${subject}`;
    const safeMessage = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: subjectLine,
        html: [
          "<h2>New Shenoy Labs contact form submission</h2>",
          `<p><strong>Name:</strong> ${name}</p>`,
          `<p><strong>Email:</strong> ${email}</p>`,
          `<p><strong>Subject:</strong> ${subject}</p>`,
          `<p><strong>Message:</strong></p><p>${safeMessage.replace(/\n/g, "<br />")}</p>`,
        ].join(""),
      }),
    });

    if (!resendResponse.ok) {
      logContactSecurityEvent("contact_delivery_rejected", {
        ip,
        provider: "resend",
        status: resendResponse.status,
      });
      const response: ContactResponseBody = {
        ok: false,
        message: "Email provider rejected the request.",
      };
      return Response.json(
        response,
        { status: 502 },
      );
    }

    const response: ContactResponseBody = {
      ok: true,
      message: "Message sent. I will get back to you soon.",
    };
    return Response.json(
      response,
      { status: 200 },
    );
  } catch {
    const response: ContactResponseBody = {
      ok: false,
      message: "Invalid payload or unexpected server error.",
    };
    return Response.json(
      response,
      { status: 400 },
    );
  }
}
