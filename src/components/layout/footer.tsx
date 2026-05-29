import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/articles", label: "Articles" },
  { href: "/about", label: "About" },
];

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/support", label: "Support" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="footer-reveal border-t border-border/60 bg-background/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Row 1 — Social + Brand (primary) */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-border/60 py-6 sm:flex-row sm:items-center">
          <span className="inline-flex items-center gap-2 font-heading text-base font-medium text-foreground sm:text-sm">
            <span className="identity-pip" aria-hidden="true" />
            <span>Shenoy<span className="text-primary">Labs</span></span>
          </span>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-4">
            <a
              href="https://github.com/Lakshmanshenoy"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-border/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              GitHub ↗
            </a>
            <a
              href="https://x.com/shenoylakshman"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-border/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              X ↗
            </a>
            <a
              href="https://linkedin.com/in/lakshmanshenoy"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-border/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>

        {/* Row 2 — Primary nav links */}
        <div className="flex flex-col items-start gap-4 border-b border-border/60 py-5 sm:flex-row sm:items-center sm:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-0 py-1.5 text-base text-muted-foreground transition-colors hover:text-foreground sm:px-0 sm:text-sm"
            >
              {link.label}
            </Link>
          ))}
          <p className="text-left text-xs tracking-[0.1em] text-muted-foreground uppercase sm:ml-auto sm:text-right">
            Think · <span className="text-primary">Learn</span> · Solve
          </p>
        </div>

        {/* Row 3 — Copyright + legal (small, tertiary) */}
        <div className="flex flex-col items-start justify-between gap-4 pb-6 pt-5 sm:flex-row sm:items-center sm:gap-3">
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} ShenoyLabs. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-1.5 py-1 text-xs text-muted-foreground/75 transition-colors hover:text-muted-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
