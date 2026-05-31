"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "shenoylabs:consent:analytics";

export default function CookieBanner() {
  // Start hidden on both server and the client's first render so the
  // initial DOM matches and avoids hydration mismatches. Read localStorage
  // after mount and then reveal the banner if needed.
  const [visible, setVisible] = useState<boolean>(false);

  const [announce, setAnnounce] = useState<string>("");
  const acceptRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (visible) {
      acceptRef.current?.focus();
    }
  }, [visible]);

  useEffect(() => {
    try {
      const v = localStorage.getItem(CONSENT_KEY);
      // show banner when there's no stored consent — defer state update
      // to avoid synchronous setState inside effect which triggers
      // cascading renders and is flagged by our lint rules.
      setTimeout(() => setVisible(!v), 0);
    } catch {
      // leave hidden on error
      setTimeout(() => setVisible(false), 0);
    }
  }, []);

  const sendConsentEvent = async (action: "grant" | "revoke") => {
    const payload = { action: action === "grant" ? "grant" : "revoke", type: "analytics" };
    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("/api/consent POST failed", res.status, text || res.statusText);
      }
    } catch (err) {
      console.error("/api/consent send error", err);
    }
  };

  const accept = async () => {
    try {
      localStorage.setItem(CONSENT_KEY, "granted");
      window.dispatchEvent(new Event("cookie-consent-changed"));
      sendConsentEvent("grant");
      setAnnounce("Analytics cookies accepted.");
    } catch {
      setAnnounce("Analytics cookies accepted.");
    }
    setVisible(false);
  };

  const reject = async () => {
    try {
      localStorage.setItem(CONSENT_KEY, "denied");
      sendConsentEvent("revoke");
      setAnnounce("Analytics cookies rejected.");
    } catch {
      setAnnounce("Analytics cookies rejected.");
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      aria-describedby="cookie-banner-desc"
      className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-3xl rounded-xl bg-card/95 p-4 shadow-lg"
    >
      <p id="cookie-banner-desc" className="sr-only">
        This site uses analytics cookies. You can accept, reject, or manage cookie
        preferences.
      </p>

      <div className="flex items-start justify-between gap-4">
        <div className="text-sm leading-6 text-muted-foreground">
          <p>
            We use Google Analytics to collect anonymous usage data to improve this
            site. No personal data is sold. Read our{' '}
            <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </Link>
            {' '}for details.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={reject}
            className="rounded-md border border-border/60 bg-transparent px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/5"
          >
            Reject
          </button>

          <Link
            href="/privacy-policy"
            className="rounded-md border border-border/60 bg-transparent px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/5"
          >
            Manage
          </Link>

          <button
            ref={acceptRef}
            onClick={accept}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
          >
            Accept
          </button>
        </div>
      </div>

      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announce}
      </p>
    </div>
  );
}
