"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const paneId = "reader-scroll-pane";

    const updateProgress = () => {
      const pane = document.getElementById(paneId);
      if (pane && pane.scrollHeight - pane.clientHeight > 4) {
        const max = pane.scrollHeight - pane.clientHeight;
        const pct = max > 0 ? (pane.scrollTop / max) * 100 : 0;
        setProgress(Math.min(100, Math.max(0, pct)));
      } else {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        setProgress(Math.min(100, Math.max(0, pct)));
      }
    };

    const pane = document.getElementById(paneId);
    window.addEventListener("scroll", updateProgress, { passive: true });
    if (pane) pane.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
      if (pane) pane.removeEventListener("scroll", updateProgress);
    };
  }, []);

  return (
    <div
      className="fixed left-0 top-0 z-[60] h-[2px] bg-primary transition-[width] duration-75 ease-out"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  );
}
