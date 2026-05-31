"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { readStore } from "@/lib/reading-store";

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
      return window.localStorage.getItem(dismissKey) === "true";
    } catch {
      return false;
    }
  });

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const overlayRef = useRef<HTMLElement | null>(null);
  const [closePos, setClosePos] = useState<{ left?: number; right?: number; top?: number } | null>(null);

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
        if (style.position === "fixed" || style.position === "absolute") {
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
      // ignore
    }
  };


  // draw only after current article is marked completed
  useEffect(() => {
    if (typeof window === "undefined") return;

    const match = window.location.pathname.match(/^\/articles\/([^/]+)/);
    const slug = match ? match[1] : null;
    if (!slug) return;

    let intervalId: number | null = null;

    const tryDraw = () => {
      if (dismissed || drawn || !scriptLoaded) return;
      try {
        const store = readStore();
        const visit = store.visits[slug];
        if (visit && visit.completed) {
          try {
            window.kofiWidgetOverlay?.draw("lakshmanshenoy", {
              type: "floating-chat",
              "floating-chat.donateButton.text": "Support",
              "floating-chat.donateButton.background-color": "#f45d22",
              "floating-chat.donateButton.text-color": "#fff",
            });
            setDrawn(true);
          } catch {}
        }
      } catch {}
    };

    tryDraw();
    intervalId = window.setInterval(tryDraw, 1000);

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [scriptLoaded, dismissed, drawn]);

  useEffect(() => {
    if (!drawn) return;
    if (typeof document === "undefined") return;

    const findOverlayElement = (): HTMLElement | null => {
      const iframe = document.querySelector<HTMLIFrameElement>('iframe[src*="ko-fi.com"]');
      if (iframe) {
        let node: HTMLElement | null = iframe as unknown as HTMLElement;
        for (let i = 0; i < 6 && node; i += 1) {
          const style = window.getComputedStyle(node);
          if (style.position === "fixed" || style.position === "absolute") return node;
          node = node.parentElement;
        }
        return iframe as unknown as HTMLElement;
      }

      const candidates = Array.from(document.querySelectorAll<HTMLElement>('[id*="kofi" i], [id*="ko-fi" i], [class*="kofi" i], [class*="ko-fi" i]'));
      for (const el of candidates) {
        const style = window.getComputedStyle(el);
        if (style.position === "fixed" || style.position === "absolute") return el;
      }
      return null;
    };

    const positionClose = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const buttonSize = 40;
      const gap = 8;
      const top = Math.max(8, rect.top + (rect.height - buttonSize) / 2);

      if (rect.left > buttonSize + gap + 8) {
        const left = Math.max(8, rect.left - buttonSize - gap);
        setClosePos({ left, top });
      } else if (window.innerWidth - rect.right > buttonSize + gap + 8) {
        const left = rect.right + gap;
        setClosePos({ left, top });
      } else {
        const right = Math.max(8, window.innerWidth - rect.right + gap);
        setClosePos({ right, top });
      }
    };

    const initial = findOverlayElement();
    if (initial) {
      overlayRef.current = initial;
      positionClose(initial);
    }

    const mo = new MutationObserver(() => {
      if (!overlayRef.current) {
        const found = findOverlayElement();
        if (found) {
          overlayRef.current = found;
          positionClose(found);
        }
      } else {
        positionClose(overlayRef.current);
      }
    });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true });

    const onResize = () => {
      if (overlayRef.current) positionClose(overlayRef.current);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, { passive: true });

    return () => {
      mo.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
    };
  }, [drawn]);

  if (dismissed) return null;

  return (
    <>
      {drawn && closePos ? (
        <button
          type="button"
          aria-label="Close support floating bar"
          onClick={closeOverlay}
          style={{
            position: "fixed",
            left: closePos.left ?? undefined,
            right: closePos.right ?? undefined,
            top: closePos.top,
            zIndex: 1200,
          }}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 text-white font-bold shadow-md transition hover:bg-red-700 px-3 py-2 text-sm"
        >
          Close
        </button>
      ) : null}

      <Script
        src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
    </>
  );
}
