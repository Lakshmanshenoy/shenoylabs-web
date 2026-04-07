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
    // Reset and re-observe on every route change so reveal animations
    // fire correctly without requiring a full page refresh.
    const targets = document.querySelectorAll<HTMLElement>(
      ".reveal, .reveal-group",
    );

    if (!targets.length) return;

    // Remove "visible" from any elements that got it on a previous route
    targets.forEach((el) => el.classList.remove("visible"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="page-enter flex-1">{children}</main>
      <Footer />
    </div>
  );
}
