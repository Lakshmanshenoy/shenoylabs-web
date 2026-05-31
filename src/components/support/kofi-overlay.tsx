"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    kofiWidgetOverlay?: {
      draw: (handle: string, options: Record<string, string>) => void;
    };
  }
}

export function KofiOverlay() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    function initOverlay() {
      window.kofiWidgetOverlay?.draw("lakshmanshenoy", {
        type: "floating-chat",
        "floating-chat.donateButton.text": "Support Us",
        "floating-chat.donateButton.background-color": "#f45d22",
        "floating-chat.donateButton.text-color": "#fff",
      });
    }

    if (window.kofiWidgetOverlay) {
      initOverlay();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://storage.ko-fi.com/cdn/scripts/overlay-widget.js";
    script.async = true;
    script.onload = initOverlay;
    document.body.appendChild(script);
  }, []);

  return null;
}
