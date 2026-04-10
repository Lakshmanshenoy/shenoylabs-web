"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "shenoylabs:consent:analytics";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(CONSENT_KEY);
      if (!v) setVisible(true);
    } catch (_) {}
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "granted");
      window.dispatchEvent(new Event("cookie-consent-changed"));
    } catch (_) {}
    setVisible(false);
  };

  const dismiss = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "denied");
    } catch (_) {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-3xl rounded-xl bg-card/95 p-4 shadow-lg">
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
            onClick={dismiss}
            className="rounded-md border border-border/60 bg-transparent px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/5"
          >
            Dismiss
          </button>
          <button
            onClick={accept}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
