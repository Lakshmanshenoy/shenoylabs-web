import Link from "next/link";

const primaryLinks = [
  { href: "/articles", label: "Investigations" },
  { href: "/projects", label: "Projects" },
  { href: "/concepts", label: "Concepts" },
  { href: "/about", label: "About" },
];

const secondaryLinks = [
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms-of-service", label: "Terms" },
  { href: "/support", label: "Support" },
];

export function Footer() {
  return (
    <footer className="footer-reveal border-t border-border/70 bg-background/90">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <p className="font-heading text-xl tracking-tight">Shenoy Labs</p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            A long-term digital environment for inquiry, systems thinking, and reflective reading.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {secondaryLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <span>© {new Date().getFullYear()} Shenoy Labs</span>
        </div>
      </div>
    </footer>
  );
}
