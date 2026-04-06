import Link from "next/link";

const footerLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/support", label: "Support" },
  { href: "/contact", label: "Contact" },
  { href: "https://github.com/Lakshmanshenoy", label: "GitHub" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold">Shenoy Labs</h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Premium hybrid product studio across projects, research, and
              future interactive tools.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Build. Learn. Ship better.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Shenoy Labs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
