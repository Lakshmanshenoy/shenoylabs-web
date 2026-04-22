"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Forces an interactive challenge in development so the widget is visibly shown.
const TURNSTILE_TEST_SITE_KEY = "3x00000000000000000000FF";

function subscribeToHydration() {
  return () => {};
}

function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
}

type SubmitState =
  | { status: "idle" }
  | { status: "notice"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  captchaToken: string;
  website?: string;
  submittedAt: number;
};

const fieldClassName =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ContactForm() {
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const [isPending, setIsPending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [verificationReady, setVerificationReady] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const turnstileSiteKey = hydrated
    ? isLocalHostname(window.location.hostname)
      ? TURNSTILE_TEST_SITE_KEY
      : process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    : "";
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  function resetTurnstileWidget() {
    if (verificationReady) {
      turnstileRef.current?.reset();
    }
  }

  async function getVerificationToken(formData: FormData) {
    const responseFieldToken = String(formData.get("cf-turnstile-response") ?? "").trim();
    const currentToken = captchaToken || responseFieldToken;

    if (currentToken) {
      return currentToken;
    }

    if (!turnstileSiteKey) {
      throw new Error("Verification is temporarily unavailable. Please try again shortly.");
    }

    if (!verificationReady) {
      throw new Error("Verification is still loading. Please wait a moment and try again.");
    }

    throw new Error("Please complete verification and try again.");
  }

  async function onSubmit(formData: FormData) {
    try {
      setIsPending(true);
      setSubmitState({ status: "idle" });

      const token = await getVerificationToken(formData);

      const payload: ContactPayload = {
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        subject: String(formData.get("subject") ?? "").trim(),
        message: String(formData.get("message") ?? "").trim(),
        captchaToken: token,
        website: String(formData.get("website") ?? "").trim(),
        submittedAt: Date.now(),
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        fallbackToEmail?: boolean;
      };

      if (data.fallbackToEmail) {
        setSubmitState({
          status: "notice",
          message: data.message ?? "Verification is temporarily unavailable. Please email directly.",
        });
        return;
      }

      if (!res.ok || !data.ok) {
        setSubmitState({
          status: "error",
          message: data.message ?? "Could not send your message right now.",
        });
        return;
      }

      setSubmitState({
        status: "success",
        message: data.message ?? "Thanks. Your message has been delivered.",
      });
      setCaptchaToken("");
      resetTurnstileWidget();
    } catch (error) {
      setSubmitState({
        status: "error",
        message:
          error instanceof Error ? error.message : "Network issue. Please try again in a minute.",
      });
      setCaptchaToken("");
      resetTurnstileWidget();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      action={onSubmit}
      className="grid gap-4 rounded-2xl border border-border/80 bg-card/95 p-5 sm:p-6"
    >
      <div className="grid gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input id="name" name="name" autoComplete="name" required minLength={2} maxLength={80} />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={160}
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="subject" className="text-sm font-medium">
          Subject
        </label>
        <Input id="subject" name="subject" required minLength={3} maxLength={140} />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={20}
          maxLength={4000}
          rows={7}
          className={fieldClassName}
          placeholder="Tell me what you're building, where you're blocked, or what you'd like help with."
        />
      </div>

      {/* Honeypot field: bots tend to fill hidden inputs. */}
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {turnstileSiteKey ? (
        <div className="grid gap-2">
          <Turnstile
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            options={{
              action: "contact_form",
              size: "flexible",
              refreshExpired: "auto",
              theme: "auto",
            }}
            onWidgetLoad={() => {
              setVerificationReady(true);
            }}
            onSuccess={(token) => {
              setCaptchaToken(token);
              setSubmitState((currentState) =>
                currentState.status === "error" && currentState.message.toLowerCase().includes("verification")
                  ? { status: "idle" }
                  : currentState,
              );
            }}
            onExpire={() => {
              setCaptchaToken("");
              setSubmitState({
                status: "error",
                message: "Verification expired. Please try again.",
              });
              resetTurnstileWidget();
            }}
            onError={() => {
              setCaptchaToken("");
              setVerificationReady(false);
              setSubmitState({
                status: "error",
                message: "Verification failed to load. Disable blockers or refresh the page, or email directly.",
              });
            }}
            onTimeout={() => {
              setCaptchaToken("");
              setSubmitState({
                status: "error",
                message: "Verification timed out. Please try again.",
              });
            }}
          />

          <p className="text-xs text-muted-foreground">
            Complete the verification before sending. If the widget does not appear, refresh the page or disable blockers for this site.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {hydrated
            ? "Verification is temporarily unavailable. Please try again shortly."
            : "Loading verification..."}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Sending..." : "Send message"}
      </Button>

      {submitState.status !== "idle" ? (
        <p
          className={cn(
            "text-sm",
            submitState.status === "success"
              ? "text-emerald-600"
              : submitState.status === "notice"
                ? "text-amber-700"
                : "text-destructive",
          )}
          aria-live="polite"
        >
          {submitState.message}
        </p>
      ) : null}
    </form>
  );
}