"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    kofiWidgetOverlay?: {
      draw: (handle: string, options: Record<string, string>) => void;
    };
  }
}

export function KofiOverlay() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const drawnRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const pollRef = useRef<number | null>(null);

  const findOverlayElements = (): HTMLElement[] => {
    if (typeof document === "undefined") return [];
    const set = new Set<HTMLElement>();
    const iframe = document.querySelector<HTMLIFrameElement>('iframe[src*="ko-fi.com"]');
    if (iframe) set.add(iframe as unknown as HTMLElement);
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>('[id*="kofi" i], [id*="ko-fi" i], [class*="kofi" i], [class*="ko-fi" i]')
    );
    for (const c of candidates) set.add(c);
    return Array.from(set);
  };

  const hideNodes = (nodes: HTMLElement[]) => {
    for (const n of nodes) {
      try {
        n.style.display = "none";
        n.setAttribute("data-kofi-hidden", "true");
      } catch {}
    }
  };

  const showNodes = (nodes: HTMLElement[]) => {
    for (const n of nodes) {
      try {
        n.style.display = "";
        n.removeAttribute("data-kofi-hidden");
      } catch {}
    }
  };

  const ensureOverlayDisplayed = () => {
    if (typeof window === "undefined") return;
    if (pollRef.current) return;
    let elapsed = 0;
    const max = 5000;
    const interval = 300;
    pollRef.current = window.setInterval(() => {
      const nodes = findOverlayElements();
      if (nodes.length > 0) {
        if (!sheetOpen && visible) showNodes(nodes);
        else hideNodes(nodes);
        if (pollRef.current) {
          window.clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } else {
        elapsed += interval;
        if (elapsed > max && pollRef.current) {
          window.clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    }, interval) as unknown as number;
  };

  useEffect(() => {
    const handler = (ev: Event) => {
      const e = ev as CustomEvent<{ name: string; open: boolean }>;
      if (!e.detail) return;
      const { name, open } = e.detail;
      if (name === "toc" || name === "rxp") {
        setSheetOpen(open);
      }
    };
    window.addEventListener("shenoylabs:sheet-state", handler as EventListener);
    return () => window.removeEventListener("shenoylabs:sheet-state", handler as EventListener);
  }, []);

  const getScrollPercent = (): number => {
    if (typeof document === "undefined") return 0;
    const pane = document.getElementById("reader-scroll-pane");
    if (pane && pane.scrollHeight - pane.clientHeight > 4) {
      const max = pane.scrollHeight - pane.clientHeight;
      return Math.min(100, Math.round((pane.scrollTop / max) * 100));
    }
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const threshold = 15;
    const onScroll = () => {
      const pct = getScrollPercent();
      // once user scrolls past threshold, keep the overlay visible
      if (pct >= threshold) {
        setVisible(true);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const pane = document.getElementById("reader-scroll-pane");
    if (pane) pane.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (pane) pane.removeEventListener("scroll", onScroll);
    };
  }, [sheetOpen]);

  useEffect(() => {
    if (!scriptLoaded) return;
    if (visible && !drawnRef.current) {
      try {
        window.kofiWidgetOverlay?.draw("lakshmanshenoy", {
          type: "floating-chat",
          "floating-chat.donateButton.text": "Support",
          "floating-chat.donateButton.background-color": "#f45d22",
          "floating-chat.donateButton.text-color": "#fff",
        });
        // avoid synchronous setState inside effect by using a ref
        drawnRef.current = true;

        // poll for the overlay DOM nodes and show/hide when found
        if (!pollRef.current) {
          let elapsed = 0;
          const max = 5000;
          const interval = 300;
          pollRef.current = window.setInterval(() => {
            const nodes = findOverlayElements();
            if (nodes.length > 0) {
              if (!sheetOpen && visible) showNodes(nodes);
              else hideNodes(nodes);
              if (pollRef.current) {
                window.clearInterval(pollRef.current);
                pollRef.current = null;
              }
            } else {
              elapsed += interval;
              if (elapsed > max && pollRef.current) {
                window.clearInterval(pollRef.current);
                pollRef.current = null;
              }
            }
          }, interval) as unknown as number;
        }
      } catch {}
    } else if (drawnRef.current) {
      const nodes = findOverlayElements();
      if (nodes.length > 0) {
        if (!sheetOpen && visible) showNodes(nodes);
        else hideNodes(nodes);
      } else {
        if (visible && !sheetOpen && !pollRef.current) ensureOverlayDisplayed();
      }
    }
  }, [scriptLoaded, visible, sheetOpen]);

  useEffect(() => {
    const nodes = findOverlayElements();
    if (nodes.length > 0) {
      if (sheetOpen) hideNodes(nodes);
      else if (visible) showNodes(nodes);
    }
  }, [sheetOpen, visible]);

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  return (
    <Script
      src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
      strategy="afterInteractive"
      onLoad={() => setScriptLoaded(true)}
    />
  );
}
