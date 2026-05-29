import Link from "next/link";

type ChapterLink = {
  href: string;
  label: string;
};

type ChapterOpenerProps = {
  kicker: string;
  title: string;
  deck: string;
  links?: ChapterLink[];
  className?: string;
  headingLevel?: "h1" | "h2";
};

export function ChapterOpener({
  kicker,
  title,
  deck,
  links = [],
  className,
  headingLevel = "h1",
}: ChapterOpenerProps) {
  const HeadingTag = headingLevel;

  return (
    <header className={className}>
      <p className="editorial-kicker inline-flex items-center gap-2">
        <span className="identity-pip" aria-hidden="true" />
        {kicker}
      </p>
      <HeadingTag className="mt-4 font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
        {title}
      </HeadingTag>
      <p className="editorial-deck mt-4 max-w-3xl">{deck}</p>
      {links.length > 0 ? (
        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Chapter links">
          {links.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className="rounded-full border border-border/70 px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:border-primary/60 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
