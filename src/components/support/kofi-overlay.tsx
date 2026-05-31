"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Script from "next/script";

declare global {
  interface Window {
    kofiWidgetOverlay?: {
      draw: (handle: string, options: Record<string, string>) => void;
    };
  }
}

export function KofiOverlay() {
  const dismissKey = "shenoylabs:kofi-floating:dismissed:v1";
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem("shenoylabs:kofi-floating:dismissed:v1") === "true";
    } catch {
      return false;
    }
  });

  const hideFloatingOverlay = () => {
    if (typeof document === "undefined") return;

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[src*="ko-fi.com"]');
    const fixedCandidates = [
      ...Array.from(document.querySelectorAll<HTMLElement>('[id*="kofi" i], [id*="ko-fi" i], [class*="kofi" i], [class*="ko-fi" i]')),
      ...Array.from(document.querySelectorAll<HTMLElement>('iframe[src*="ko-fi.com"]')),
    ];

    const toHide = new Set<HTMLElement>();
    for (const el of fixedCandidates) {
      let node: HTMLElement | null = el;
      for (let depth = 0; depth < 5 && node; depth += 1) {
        const style = window.getComputedStyle(node);
        if (style.position === "fixed") {
          toHide.add(node);
          break;
        }
        node = node.parentElement;
      }
    }

    if (iframe) {
      let node: HTMLElement | null = iframe as unknown as HTMLElement;
      for (let depth = 0; depth < 5 && node; depth += 1) {
        toHide.add(node);
        node = node.parentElement;
      }
    }

    toHide.forEach((node) => {
      node.style.display = "none";
      node.setAttribute("data-kofi-dismissed", "true");
    });
  };

  useEffect(() => {
    if (dismissed) hideFloatingOverlay();
  }, [dismissed]);

  const closeOverlay = () => {
    setDismissed(true);
    hideFloatingOverlay();
    try {
      window.localStorage.setItem(dismissKey, "true");
    } catch {
      // Ignore storage write failures in private browsing.
    }
  };

  if (dismissed) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close support floating bar"
        onClick={closeOverlay}
        className="fixed right-4 bottom-24 z-[1200] inline-flex size-7 items-center justify-center rounded-full border border-border/80 bg-background/95 text-foreground shadow-md transition hover:bg-background"
      >
        <X className="size-3.5" />
      </button>
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
    </>
  );
}
