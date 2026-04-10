"use client";

import { useMemo, useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SubmitState =
  | { status: "idle" }
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
  const [isPending, setIsPending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const startedAt = useMemo(() => Date.now(), []);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const pendingVerificationRef = useRef<{
    resolve: (token: string) => void;
    reject: (reason?: unknown) => void;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);

  function resolvePendingVerification(token: string) {
    const pendingVerification = pendingVerificationRef.current;
    if (!pendingVerification) {
      return;
    }

    clearTimeout(pendingVerification.timeoutId);
    pendingVerification.resolve(token);
    pendingVerificationRef.current = null;
  }

  function rejectPendingVerification(message: string) {
    const pendingVerification = pendingVerificationRef.current;
    if (!pendingVerification) {
      setSubmitState({
        status: "error",
        message,
      });
      return;
    }

    clearTimeout(pendingVerification.timeoutId);
    pendingVerification.reject(new Error(message));
    pendingVerificationRef.current = null;
  }

  async function getVerificationToken(formData: FormData) {
    const responseFieldToken = String(formData.get("cf-turnstile-response") ?? "").trim();
    const currentToken = turnstileRef.current?.getResponse() || captchaToken || responseFieldToken;

    if (currentToken) {
      return currentToken;
    }

    if (!turnstileSiteKey || !turnstileRef.current) {
      throw new Error("Verification is temporarily unavailable. Please try again shortly.");
    }

    turnstileRef.current.reset();

    const token = await new Promise<string>((resolve, reject) => {
      pendingVerificationRef.current = {
        resolve,
        reject,
        timeoutId: setTimeout(() => {
          pendingVerificationRef.current = null;
          reject(new Error("Verification timed out. Please try again."));
        }, 12_000),
      };

      turnstileRef.current?.execute();
    });

    return token;
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
        submittedAt: startedAt,
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { ok?: boolean; message?: string };

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
      turnstileRef.current?.reset();
    } catch (error) {
      setSubmitState({
        status: "error",
        message:
          error instanceof Error ? error.message : "Network issue. Please try again in a minute.",
      });
      setCaptchaToken("");
      turnstileRef.current?.reset();
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
        <Turnstile
          ref={turnstileRef}
          siteKey={turnstileSiteKey}
          options={{
            action: "contact_form",
            appearance: "execute",
            execution: "execute",
            refreshExpired: "auto",
          }}
          onSuccess={(token) => {
            setCaptchaToken(token);
            resolvePendingVerification(token);
          }}
          onExpire={() => {
            setCaptchaToken("");
            rejectPendingVerification("Verification expired. Please try again.");
            turnstileRef.current?.reset();
          }}
          onError={() => {
            setCaptchaToken("");
            rejectPendingVerification("Verification failed. Please retry.");
          }}
          onTimeout={() => {
            setCaptchaToken("");
            rejectPendingVerification("Verification timed out. Please try again.");
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Verification is temporarily unavailable. Please try again shortly.
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Sending..." : "Send message"}
      </Button>

      {submitState.status !== "idle" ? (
        <p
          className={cn(
            "text-sm",
            submitState.status === "success" ? "text-emerald-600" : "text-destructive",
          )}
          aria-live="polite"
        >
          {submitState.message}
        </p>
      ) : null}
    </form>
  );
}