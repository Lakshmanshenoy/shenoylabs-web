"use client";

import Script from "next/script";

declare global {
  interface Window {
    kofiWidgetOverlay?: {
      draw: (handle: string, options: Record<string, string>) => void;
    };
  }
}

export function KofiOverlay() {
  return (
    <Script
      src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
      strategy="afterInteractive"
      onLoad={() => {
        window.kofiWidgetOverlay?.draw("lakshmanshenoy", {
          type: "floating-chat",
          "floating-chat.donateButton.text": "Support",
          "floating-chat.donateButton.background-color": "#f45d22",
          "floating-chat.donateButton.text-color": "#fff",
        });
      }}
    />
  );
}
