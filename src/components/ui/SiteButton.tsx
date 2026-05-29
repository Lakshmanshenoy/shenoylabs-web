import Link from "next/link";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

interface SiteButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary hover:opacity-90 text-primary-foreground font-medium px-4 py-2 rounded-lg text-sm",
  secondary:
    "border border-border hover:border-primary text-muted-foreground hover:text-foreground font-medium px-4 py-2 rounded-lg text-sm",
  ghost:
    "text-muted-foreground hover:text-foreground underline underline-offset-2 decoration-primary/40 hover:decoration-primary text-sm",
};

export function SiteButton({
  href,
  onClick,
  variant = "primary",
  children,
  className,
  external,
}: SiteButtonProps) {
  const cls = cn(
    "inline-flex items-center gap-1.5 transition-colors duration-150",
    variants[variant],
    className,
  );

  if (href) {
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    ) : (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
