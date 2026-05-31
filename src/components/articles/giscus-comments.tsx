"use client";

import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";

/**
 * GiscusComments — powered by https://giscus.app
 *
 * Configure via environment variables:
 *   NEXT_PUBLIC_GISCUS_REPO          e.g. "Lakshmanshenoy/shenoylabs-web"
 *   NEXT_PUBLIC_GISCUS_REPO_ID       from giscus.app configurator
 *   NEXT_PUBLIC_GISCUS_CATEGORY      Discussion category name, e.g. "Announcements"
 *   NEXT_PUBLIC_GISCUS_CATEGORY_ID   from giscus.app configurator
 *
 * Giscus uses GitHub Discussions as the backend. The component renders a
 * native <script> tag that loads the Giscus widget, which shows an iframe
 * with comments from the matching GitHub Discussion thread.
 *
 * Falls back gracefully to null if env vars are not configured.
 */

type GiscusCommentsProps = {
  slug: string;
};

export function GiscusComments({ slug }: GiscusCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO ?? "";
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? "";
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? "Announcements";
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? "";

  useEffect(() => {
    // Don't render if unconfigured
    if (!repoId || !categoryId || !repo) return;
    if (mounted.current) return;
    mounted.current = true;

    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", category);
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");
    script.crossOrigin = "anonymous";
    script.async = true;
    container.appendChild(script);

    return () => {
      // Cleanup on slug change or unmount
      if (container) container.innerHTML = "";
      mounted.current = false;
    };
  }, [slug, repo, repoId, category, categoryId]);

  // Don't render anything if not configured
  if (!repo || !repoId || !categoryId) return null;

  return (
    <section className="mt-10 border-t border-border/60 pt-8" aria-label="Comments">
      <h2 className="mb-5 flex items-center gap-2 font-heading text-xl font-semibold tracking-tight">
        <MessageSquare className="size-5 text-muted-foreground" />
        Discussion
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Comments are powered by{" "}
        <a
          href="https://giscus.app"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Giscus
        </a>{" "}
        via GitHub Discussions. Sign in with GitHub to comment.
      </p>
      <div ref={containerRef} className="giscus" />
    </section>
  );
}
