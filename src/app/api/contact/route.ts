import { headers } from "next/headers";

import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

type ContactRequestBody = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown;
  submittedAt?: unknown;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const limiter = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 45_000;

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

function rateLimited(key: string) {
  const now = Date.now();
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

export async function POST(request: Request) {
  try {
    const raw = (await request.json()) as ContactRequestBody;

    const name = asText(raw.name);
    const email = asText(raw.email);
    const subject = asText(raw.subject);
    const message = asText(raw.message);
    const website = asText(raw.website);
    const submittedAt = typeof raw.submittedAt === "number" ? raw.submittedAt : 0;

    // Basic anti-spam: hidden field and unrealistically fast submit windows.
    if (website) {
      return Response.json({ ok: true, message: "Message received." }, { status: 200 });
    }
    if (!submittedAt || Date.now() - submittedAt < 1200) {
      return Response.json(
        { ok: false, message: "Please wait a moment before submitting." },
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
      return Response.json(
        { ok: false, message: "Please check your input and try again." },
        { status: 400 },
      );
    }

    const requestHeaders = await headers();
    const ip = getClientIpFromHeaders(requestHeaders);
    if (rateLimited(ip)) {
      return Response.json(
        { ok: false, message: "Too many attempts. Please retry shortly." },
        { status: 429 },
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL || siteConfig.contactEmail;
    const fromEmail = process.env.CONTACT_FROM_EMAIL;

    if (!resendApiKey || !fromEmail) {
      return Response.json(
        {
          ok: false,
          message:
            `Contact form delivery is not configured yet. Please email ${siteConfig.contactEmail} directly.`,
        },
        { status: 503 },
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
      return Response.json(
        { ok: false, message: "Email provider rejected the request." },
        { status: 502 },
      );
    }

    return Response.json(
      { ok: true, message: "Message sent. I will get back to you soon." },
      { status: 200 },
    );
  } catch {
    return Response.json(
      { ok: false, message: "Invalid payload or unexpected server error." },
      { status: 400 },
    );
  }
}
