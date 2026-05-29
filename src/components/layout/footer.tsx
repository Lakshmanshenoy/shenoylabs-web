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
    <footer className="footer-reveal border-t border-border/60 bg-background/92 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Row 1 — Social + Brand (primary) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 py-6">
          <span className="inline-flex items-center gap-2 font-heading text-sm font-medium text-foreground">
            <span className="identity-pip" aria-hidden="true" />
            Shenoy<span className="text-primary">Labs</span>
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Lakshmanshenoy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub ↗
            </a>
            <a
              href="https://x.com/shenoylakshman"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              X ↗
            </a>
            <a
              href="https://linkedin.com/in/lakshmanshenoy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>

        {/* Row 2 — Primary nav links */}
        <div className="flex flex-wrap items-center gap-6 border-b border-border/60 py-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <p className="ml-auto text-right text-xs tracking-[0.1em] text-muted-foreground uppercase">
            Think · <span className="text-primary">Learn</span> · Solve
          </p>
        </div>

        {/* Row 3 — Copyright + legal (small, tertiary) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 pt-5">
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} ShenoyLabs. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
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
