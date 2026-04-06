import type React from "react";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MDXComponents = Record<string, React.ElementType<any>>;

import { cn } from "@/lib/utils";

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
    h2: ({ className, ...props }) => (
      <h2
        className={cn(
          "font-heading mt-10 mb-4 text-2xl font-semibold tracking-tight",
          className,
        )}
        {...props}
      />
    ),
    h3: ({ className, ...props }) => (
      <h3
        className={cn(
          "font-heading mt-8 mb-3 text-xl font-semibold",
          className,
        )}
        {...props}
      />
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
    ...overrides,
  };
}
