import type React from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MDXComponents = Record<string, React.ElementType<any>>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function nodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map((child) => nodeText(child)).join(" ");
  }
  if (node && typeof node === "object" && "props" in node) {
    const candidate = node as { props?: { children?: React.ReactNode } };
    return nodeText(candidate.props?.children);
  }
  return "";
}

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  children?: React.ReactNode;
};

function Heading({
  level,
  className,
  children,
  ...props
}: HeadingProps & { level: 1 | 2 | 3 }) {
  const title = nodeText(children);
  const id = props.id ?? slugify(title);
  const Tag = `h${level}` as const;

  const levelClasses: Record<1 | 2 | 3, string> = {
    1: "mt-8 mb-4 text-3xl font-semibold tracking-tight first:mt-0",
    2: "mt-12 mb-4 text-2xl font-semibold tracking-tight",
    3: "mt-8 mb-3 text-xl font-semibold tracking-tight",
  };

  return (
    <Tag id={id} className={cn("group/heading font-heading scroll-mt-24", levelClasses[level], className)} {...props}>
      <a href={`#${id}`} className="heading-anchor inline-flex items-center gap-2 no-underline" aria-label={`Link to ${title}`}>
        <span>{children}</span>
        <span className="text-sm text-muted-foreground opacity-0 transition-opacity group-hover/heading:opacity-100">#</span>
      </a>
    </Tag>
  );
}

type ConceptReferenceProps = {
  concept: string;
  preview?: string;
  investigations?: string[];
};

function ConceptReference({ concept, preview, investigations = [] }: ConceptReferenceProps) {
  return (
    <aside className="semantic-block concept-reference my-8 rounded-2xl border border-border/70 bg-card/70 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Concept Reference</p>
      <h4 className="mt-2 font-heading text-lg font-semibold tracking-tight">{concept}</h4>
      {preview ? <p className="mt-2 text-sm text-muted-foreground">{preview}</p> : null}
      {investigations.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {investigations.map((item) => (
            <Link
              key={item}
              href={`/articles/${item}`}
              className="rounded-full border border-border/70 px-3 py-1 text-xs transition-colors hover:border-primary/40 hover:text-primary"
            >
              {item.replaceAll("-", " ")}
            </Link>
          ))}
        </div>
      ) : null}
    </aside>
  );
}

type TechnicalDepthProps = {
  title?: string;
  children?: React.ReactNode;
};

function TechnicalDepth({ title = "Technical depth", children }: TechnicalDepthProps) {
  return (
    <section className="semantic-block technical-depth my-8 rounded-2xl border border-border/80 bg-muted/35 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Badge variant="outline" className="text-[10px] uppercase tracking-[0.15em]">Deep dive</Badge>
        <h4 className="font-heading text-base font-semibold">{title}</h4>
      </div>
      <div className="text-sm leading-7 text-foreground/90">{children}</div>
    </section>
  );
}

type ExplorationBridgeProps = {
  title?: string;
  href: string;
  label: string;
  context?: string;
};

function ExplorationBridge({
  title = "Exploration bridge",
  href,
  label,
  context,
}: ExplorationBridgeProps) {
  return (
    <aside className="semantic-block exploration-bridge my-8 rounded-2xl border border-primary/25 bg-primary/5 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-primary/80">{title}</p>
      {context ? <p className="mt-2 text-sm text-muted-foreground">{context}</p> : null}
      <Link href={href} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80">
        {label}
        <span aria-hidden>→</span>
      </Link>
    </aside>
  );
}

type ResearchCalloutProps = {
  title: string;
  children?: React.ReactNode;
};

function ResearchCallout({ title, children }: ResearchCalloutProps) {
  return (
    <aside className="semantic-block research-callout my-8 rounded-2xl border-l-4 border-primary/50 bg-card/80 px-5 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Research callout</p>
      <h4 className="mt-1 font-heading text-base font-semibold">{title}</h4>
      <div className="mt-2 text-sm leading-7 text-foreground/90">{children}</div>
    </aside>
  );
}

type ReflectionBreakProps = {
  prompt?: string;
};

function ReflectionBreak({
  prompt = "Pause for a moment: what changed in how you see this system?",
}: ReflectionBreakProps) {
  return (
    <div className="semantic-block reflection-break my-10 rounded-2xl border border-dashed border-border/80 bg-secondary/35 px-5 py-6 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reflection break</p>
      <p className="mt-2 font-heading text-lg leading-relaxed text-foreground/90">{prompt}</p>
    </div>
  );
}

/**
 * Passed to compileMDX({ components }) on every detail page.
 * Provides calm editorial defaults plus lightweight semantic blocks.
 */
export function getMDXComponents(overrides?: MDXComponents): MDXComponents {
  return {
    h1: (props: HeadingProps) => <Heading level={1} {...props} />,
    h2: (props: HeadingProps) => <Heading level={2} {...props} />,
    h3: (props: HeadingProps) => <Heading level={3} {...props} />,
    p: ({ className, ...props }) => (
      <p className={cn("mb-6 leading-[1.9] text-foreground/90", className)} {...props} />
    ),
    ul: ({ className, ...props }) => (
      <ul className={cn("mb-6 list-disc space-y-1.5 pl-6 text-foreground/90", className)} {...props} />
    ),
    ol: ({ className, ...props }) => (
      <ol className={cn("mb-6 list-decimal space-y-1.5 pl-6 text-foreground/90", className)} {...props} />
    ),
    li: ({ className, ...props }) => <li className={cn("leading-relaxed", className)} {...props} />,
    blockquote: ({ className, ...props }) => (
      <blockquote className={cn("mb-6 border-l-4 border-primary/45 pl-5 italic text-muted-foreground", className)} {...props} />
    ),
    code: ({ className, ...props }) => (
      <code className={cn("rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground/90", className)} {...props} />
    ),
    pre: ({ className, ...props }) => (
      <pre className={cn("mb-7 overflow-x-auto rounded-xl border border-border/70 bg-muted p-5 text-sm leading-relaxed", className)} {...props} />
    ),
    a: ({ className, href = "#", ...props }) => {
      const isExternal = href.startsWith("http");
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary", className)}
            {...props}
          />
        );
      }
      return (
        <Link
          href={href}
          className={cn("text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary", className)}
          {...props}
        />
      );
    },
    hr: ({ className, ...props }) => <hr className={cn("my-10 border-border/60", className)} {...props} />,
    table: ({ className, ...props }) => (
      <div className="mb-6 overflow-x-auto">
        <table className={cn("w-full border-collapse text-sm", className)} {...props} />
      </div>
    ),
    th: ({ className, ...props }) => (
      <th className={cn("border border-border/70 bg-muted px-3 py-2 text-left font-semibold", className)} {...props} />
    ),
    td: ({ className, ...props }) => <td className={cn("border border-border/70 px-3 py-2", className)} {...props} />,
    ConceptReference,
    TechnicalDepth,
    ExplorationBridge,
    ResearchCallout,
    ReflectionBreak,
    ...overrides,
  };
}
