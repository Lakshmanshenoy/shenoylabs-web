import type React from "react";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MDXComponents = Record<string, React.ElementType<any>>;

import { cn } from "@/lib/utils";

function textFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map((child) => textFromChildren(child)).join(" ");
  }
  if (children && typeof children === "object" && "props" in children) {
    const props = (children as { props?: { children?: React.ReactNode } }).props;
    return textFromChildren(props?.children);
  }
  return "";
}

function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Custom MDX component map.
 * Passed to compileMDX({ components }) on every detail page.
 * Provides a consistent editorial prose reading experience.
 */
export function getMDXComponents(overrides?: MDXComponents): MDXComponents {
  return {
    h1: ({ className, ...props }) => (
      <h1
        className={cn(
          "font-heading mt-8 mb-4 text-3xl font-semibold tracking-tight first:mt-0",
          className,
        )}
        {...props}
      />
    ),
    h2: ({ className, id, children, ...props }) => (
      <h2
        className={cn(
          "font-heading mt-10 mb-4 text-2xl font-semibold tracking-tight",
          className,
        )}
        id={id ?? slugifyHeading(textFromChildren(children))}
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ className, id, children, ...props }) => (
      <h3
        className={cn(
          "font-heading mt-8 mb-3 text-xl font-semibold",
          className,
        )}
        id={id ?? slugifyHeading(textFromChildren(children))}
        {...props}
      >
        {children}
      </h3>
    ),
    p: ({ className, ...props }) => (
      <p
        className={cn(
          "mb-5 leading-[1.85] text-foreground/85",
          className,
        )}
        {...props}
      />
    ),
    ul: ({ className, ...props }) => (
      <ul
        className={cn("mb-5 list-disc pl-6 space-y-1.5 text-foreground/85", className)}
        {...props}
      />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={cn("mb-5 list-decimal pl-6 space-y-1.5 text-foreground/85", className)}
        {...props}
      />
    ),
    li: ({ className, ...props }) => (
      <li className={cn("leading-relaxed", className)} {...props} />
    ),
    blockquote: ({ className, ...props }) => (
      <blockquote
        className={cn(
          "mb-5 border-l-4 border-primary/50 pl-5 italic text-muted-foreground",
          className,
        )}
        {...props}
      />
    ),
    code: ({ className, ...props }) => (
      <code
        className={cn(
          "rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground/90",
          className,
        )}
        {...props}
      />
    ),
    pre: ({ className, ...props }) => (
      <pre
        className={cn(
          "mb-5 overflow-x-auto rounded-xl border border-border/70 bg-muted p-5 text-sm leading-relaxed",
          className,
        )}
        {...props}
      />
    ),
    a: ({ className, href = "#", ...props }) => {
      const isExternal = href.startsWith("http");
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-primary underline underline-offset-4 hover:text-accent",
              className,
            )}
            {...props}
          />
        );
      }
      return (
        <Link
          href={href}
          className={cn(
            "text-primary underline underline-offset-4 hover:text-accent",
            className,
          )}
          {...props}
        />
      );
    },
    hr: ({ className, ...props }) => (
      <hr className={cn("my-8 border-border/60", className)} {...props} />
    ),
    table: ({ className, ...props }) => (
      <div className="mb-5 overflow-x-auto">
        <table
          className={cn("w-full border-collapse text-sm", className)}
          {...props}
        />
      </div>
    ),
    th: ({ className, ...props }) => (
      <th
        className={cn(
          "border border-border/70 bg-muted px-3 py-2 text-left font-semibold",
          className,
        )}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td
        className={cn("border border-border/70 px-3 py-2", className)}
        {...props}
      />
    ),
    Investigation: ({ className, title = "Investigation", children, ...props }) => (
      <section className={cn("investigation-block", className)} {...props}>
        <p className="investigation-label">
          <span className="identity-pip" aria-hidden="true" />
          {title}
        </p>
        <div className="space-y-3 text-[0.98rem] leading-7 text-foreground/85">{children}</div>
      </section>
    ),
    Evidence: ({ className, title = "Evidence", children, ...props }) => (
      <aside
        className={cn(
          "investigation-block border-l-2 border-primary/70 bg-primary/[0.04]",
          className,
        )}
        {...props}
      >
        <p className="investigation-label">{title}</p>
        <div className="space-y-2 text-sm leading-7 text-foreground/80">{children}</div>
      </aside>
    ),
    Takeaway: ({ className, children, ...props }) => (
      <aside
        className={cn(
          "my-7 rounded-xl border border-border/70 bg-secondary/40 px-5 py-4",
          className,
        )}
        {...props}
      >
        <p className="editorial-kicker mb-2 inline-flex items-center gap-2 text-primary">
          <span className="identity-pip" aria-hidden="true" />
          Key Takeaway
        </p>
        <div className="text-base leading-7 text-foreground/85">{children}</div>
      </aside>
    ),
    Timeline: ({ className, children, ...props }) => (
      <ol
        className={cn(
          "my-6 space-y-3 border-l border-border/70 pl-4 marker:text-primary",
          className,
        )}
        {...props}
      >
        {children}
      </ol>
    ),
    ...overrides,
  };
}
