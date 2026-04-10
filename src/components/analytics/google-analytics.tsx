"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

type GoogleAnalyticsProps = {
  gaId?: string;
};

const CONSENT_KEY = "shenoylabs:consent:analytics";

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!gaId) return;
    try {
      setEnabled(localStorage.getItem(CONSENT_KEY) === "granted");
      const onChange = () => setEnabled(localStorage.getItem(CONSENT_KEY) === "granted");
      window.addEventListener("cookie-consent-changed", onChange);
      return () => window.removeEventListener("cookie-consent-changed", onChange);
    } catch {
      // ignore
    }
  }, [gaId]);

  if (!gaId || !enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);} 
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            anonymize_ip: true,
            send_page_view: true
          });
        `}
      </Script>
    </>
  );
}
