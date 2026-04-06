"use client";

import { useMemo, useState } from "react";

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
  website?: string;
  submittedAt: number;
};

const fieldClassName =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ContactForm() {
  const [isPending, setIsPending] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const startedAt = useMemo(() => Date.now(), []);

  async function onSubmit(formData: FormData) {
    const payload: ContactPayload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      subject: String(formData.get("subject") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      website: String(formData.get("website") ?? "").trim(),
      submittedAt: startedAt,
    };

    try {
      setIsPending(true);
      setSubmitState({ status: "idle" });

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
    } catch {
      setSubmitState({
        status: "error",
        message: "Network issue. Please try again in a minute.",
      });
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