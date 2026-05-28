"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import Link from "next/link";
import { CheckIcon, SendIcon } from "lucide-react";

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
  organization?: string;
  profileUrl?: string;
  referral?: string;
  submittedAt: number;
};

const fieldClassName =
  "w-full rounded-sm border border-input bg-transparent px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

const subjectCards = [
  {
    value: "Research collaboration",
    label: "Research collaboration",
    description: "Joint investigations, data sharing",
    icon: "🔬",
  },
  {
    value: "Article feedback",
    label: "Article feedback",
    description: "Corrections, questions, thoughts",
    icon: "📝",
  },
  {
    value: "Open source or Projects",
    label: "Open source or Projects",
    description: "PRs, bug reports, ideas",
    icon: "⚙️",
  },
  {
    value: "Speaking and writing",
    label: "Speaking and writing",
    description: "Talks, guest posts, interviews",
    icon: "🎤",
  },
  {
    value: "General hello",
    label: "General hello",
    description: "No agenda needed",
    icon: "✉️",
  },
  {
    value: "Something else",
    label: "Something else",
    description: "You tell me",
    icon: "💬",
  },
] as const;

const referralOptions = [
  "GitHub",
  "Twitter / X",
  "Search engine",
  "Word of mouth",
  "LinkedIn",
  "Newsletter",
  "Other",
] as const;

export function ContactForm() {
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const [isPending, setIsPending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [verificationReady, setVerificationReady] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectCards[0].value);
  const [subjectLine, setSubjectLine] = useState<string>(subjectCards[0].value);
  const [subjectEditedManually, setSubjectEditedManually] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const formRef = useRef<HTMLFormElement | null>(null);
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

  function resetContactForm() {
    formRef.current?.reset();
    setSubmitState({ status: "idle" });
    setSelectedSubject(subjectCards[0].value);
    setSubjectLine(subjectCards[0].value);
    setSubjectEditedManually(false);
    setMessageText("");
    setCaptchaToken("");
    resetTurnstileWidget();
  }

  function onSelectSubject(subjectValue: string) {
    setSelectedSubject(subjectValue);
    if (!subjectEditedManually || !subjectLine.trim()) {
      setSubjectLine(subjectValue);
    }
  }

  async function onSubmit(formData: FormData) {
    try {
      setIsPending(true);
      setSubmitState({ status: "idle" });

      const token = await getVerificationToken(formData);

      const message = String(formData.get("message") ?? "").trim();
      const organization = String(formData.get("organization") ?? "").trim();
      const profileUrl = String(formData.get("profileUrl") ?? "").trim();
      const referral = String(formData.get("referral") ?? "").trim();

      let messageWithContext = message;
      const contextBits: string[] = [];
      if (organization) contextBits.push(`Organization: ${organization}`);
      if (profileUrl) contextBits.push(`Website/GitHub: ${profileUrl}`);
      if (referral) contextBits.push(`Found via: ${referral}`);

      if (contextBits.length > 0) {
        const contextSuffix = `\n\nAdditional context:\n${contextBits.join("\n")}`;
        if (message.length + contextSuffix.length <= 4000) {
          messageWithContext = `${message}${contextSuffix}`;
        }
      }

      const payload: ContactPayload = {
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        subject: subjectLine.trim(),
        message: messageWithContext,
        captchaToken: token,
        website: String(formData.get("website") ?? "").trim(),
        organization,
        profileUrl,
        referral,
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
        message: data.message ?? "Message sent. I will get back to you soon.",
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
    <div className="rounded-md border border-border bg-card/95 p-5 sm:p-6">
      {submitState.status === "success" ? (
        <div className="rounded-md border border-border bg-secondary/60 p-8 text-center">
          <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckIcon className="size-7" />
          </div>
          <h3 className="font-heading text-3xl font-bold tracking-tight">Message sent.</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground italic">
            Thanks for reaching out. I received your message and will get back to you within 48 to 72 hours.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={resetContactForm}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-xs font-semibold tracking-[0.08em] text-primary-foreground uppercase transition-colors hover:bg-primary/90"
            >
              <SendIcon className="size-3.5" />
              Send another
            </button>
            <Link
              href="/articles"
              className="inline-flex items-center rounded-sm border border-border px-5 py-2.5 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:text-primary"
            >
              Read articles
            </Link>
          </div>
        </div>
      ) : (
        <form ref={formRef} action={onSubmit} className="space-y-6">
          <section>
            <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              What&apos;s this about?
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {subjectCards.map((card) => (
                <button
                  key={card.value}
                  type="button"
                  onClick={() => onSelectSubject(card.value)}
                  className={cn(
                    "relative rounded-md border p-3 text-left transition-colors",
                    selectedSubject === card.value
                      ? "border-primary bg-accent"
                      : "border-border hover:border-primary/60 hover:bg-accent/40",
                  )}
                >
                  {selectedSubject === card.value ? (
                    <span className="absolute right-2 top-2 inline-flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <CheckIcon className="size-2.5" />
                    </span>
                  ) : null}
                  <p className="text-base leading-none">{card.icon}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{card.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{card.description}</p>
                </button>
              ))}
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor="name" className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Your name
              </label>
              <Input id="name" name="name" autoComplete="name" required minLength={2} maxLength={80} className="rounded-sm" />
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="email" className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={160}
                className="rounded-sm"
              />
            </div>

            <div className="grid gap-1.5 sm:col-span-2">
              <label htmlFor="subject" className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Subject line
              </label>
              <Input
                id="subject"
                name="subject"
                required
                minLength={3}
                maxLength={140}
                className="rounded-sm"
                value={subjectLine}
                onChange={(event) => {
                  setSubjectLine(event.target.value);
                  setSubjectEditedManually(true);
                }}
              />
            </div>

            <div className="grid gap-1.5 sm:col-span-2">
              <label htmlFor="message" className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Your message
              </label>
              <textarea
                id="message"
                name="message"
                required
                minLength={20}
                maxLength={2000}
                rows={7}
                className={fieldClassName}
                placeholder="Write as much or as little as you like. No template required."
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
              />
              <p className="text-right font-mono text-[11px] text-muted-foreground">
                {messageText.length} / 2000
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            <span className="h-px flex-1 bg-border" />
            Optional
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor="organization" className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Organisation
              </label>
              <Input
                id="organization"
                name="organization"
                maxLength={100}
                placeholder="Where you work or study"
                className="rounded-sm"
              />
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="profileUrl" className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Your website or GitHub
              </label>
              <Input
                id="profileUrl"
                name="profileUrl"
                type="url"
                maxLength={200}
                placeholder="https://..."
                className="rounded-sm"
              />
            </div>

            <div className="grid gap-1.5 sm:col-span-2">
              <label htmlFor="referral" className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                How did you find ShenoyLabs?
              </label>
              <select id="referral" name="referral" className={fieldClassName} defaultValue="">
                <option value="" disabled>Select one...</option>
                {referralOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
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
                Complete verification before sending. If the widget does not appear, refresh the page or disable blockers for this site.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {hydrated
                ? "Verification is temporarily unavailable. Please try again shortly."
                : "Loading verification..."}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-xs font-semibold tracking-[0.08em] text-primary-foreground uppercase transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SendIcon className="size-3.5" />
              {isPending ? "Sending..." : "Send message"}
            </button>
            <p className="text-sm italic text-muted-foreground">
              No spam in return. Your information is never shared or sold.
            </p>
          </div>

          {submitState.status !== "idle" ? (
            <p
              className={cn(
                "text-sm",
                submitState.status === "notice"
                  ? "text-amber-700"
                  : submitState.status === "error"
                    ? "text-destructive"
                    : "text-emerald-700",
              )}
              aria-live="polite"
            >
              {submitState.message}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}