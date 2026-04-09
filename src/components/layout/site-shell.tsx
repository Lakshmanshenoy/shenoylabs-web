"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

type SiteShellProps = {
  children: React.ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Wait until full page load before mutating reveal classes. This avoids
    // racing with hydration on streaming route content.
    let observer: IntersectionObserver | null = null;
    let rafId: number | null = null;

    const startReveal = () => {
      const targets = document.querySelectorAll<HTMLElement>(
        ".reveal, .reveal-group",
      );

      if (!targets.length) return;

      targets.forEach((el) => el.classList.remove("visible"));

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              rafId = requestAnimationFrame(() => {
                entry.target.classList.add("visible");
                observer?.unobserve(entry.target);
              });
            }
          });
        },
        { threshold: 0.12 },
      );

      targets.forEach((el) => observer?.observe(el));
    };

    if (document.readyState === "complete") {
      startReveal();
    } else {
      window.addEventListener("load", startReveal, { once: true });
    }

    return () => {
      window.removeEventListener("load", startReveal);
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="page-enter flex-1">{children}</main>
      <Footer />
    </div>
  );
}
