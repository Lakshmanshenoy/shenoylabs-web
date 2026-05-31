"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    kofiwidget2?: {
      init: (title: string, color: string, userId: string) => void;
      draw: () => string;
    };
  }
}

export function KofiWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function initWidget() {
      if (window.kofiwidget2 && containerRef.current) {
        window.kofiwidget2.init("Support me on Ko-fi", "#e06020", "R0C220IH61");
        containerRef.current.innerHTML = window.kofiwidget2.draw();
      }
    }

    if (window.kofiwidget2) {
      initWidget();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://storage.ko-fi.com/cdn/widget/Widget_2.js";
    script.async = true;
    script.onload = initWidget;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return <div ref={containerRef} />;
}
