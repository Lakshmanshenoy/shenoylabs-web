"use client";

import { useEffect, useState } from "react";

export type ArticleTocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

type Props = {
  toc: ArticleTocItem[];
};

export function ArticleReaderEnhancements({ toc }: Props) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null);

  useEffect(() => {
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const pct = height > 0 ? Math.min(100, Math.round((window.scrollY / height) * 100)) : 0;
      setProgress(pct);

      const progressText = document.getElementById("reader-progress-text");
      if (progressText) {
        progressText.textContent = `${pct}% read`;
      }

      let current: string | null = null;
      for (const item of toc) {
        const section = document.getElementById(item.id);
        if (!section) continue;
        const top = section.getBoundingClientRect().top;
        if (top < 170) {
          current = item.id;
        }
      }
      if (current) setActiveId(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [toc]);

  const copyLink = async () => {
    if (typeof navigator === "undefined") return;
    await navigator.clipboard.writeText(window.location.href);
  };

  const shareOnX = () => {
    if (typeof window === "undefined") return;
    const intent = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  };

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-secondary/70 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-primary to-orange-500 transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {toc.length > 0 ? (
        <aside className="fixed right-0 top-1/2 z-30 hidden max-h-[70vh] w-60 -translate-y-1/2 rounded-l-lg border border-r-0 border-border bg-background/95 shadow-xl xl:flex xl:flex-col">
          <div className="max-h-[55vh] overflow-y-auto px-4 py-5">
            <p className="mb-3 border-b border-border pb-2 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Contents
            </p>
            <ul className="space-y-1">
              {toc.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => jumpTo(item.id)}
                    className={`w-full border-l-2 py-1 text-left text-xs leading-5 transition-colors ${
                      item.level === 3 ? "pl-5" : "pl-3"
                    } ${
                      activeId === item.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-border px-4 py-3">
            <p className="mb-2 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Share
            </p>
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="flex-1 rounded-sm border border-border px-2 py-1.5 text-[10px] font-semibold tracking-[0.06em] text-muted-foreground uppercase hover:bg-secondary"
              >
                Copy
              </button>
              <button
                onClick={shareOnX}
                className="flex-1 rounded-sm border border-border px-2 py-1.5 text-[10px] font-semibold tracking-[0.06em] text-muted-foreground uppercase hover:bg-secondary"
              >
                X
              </button>
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}
