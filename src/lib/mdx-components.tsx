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
    ConceptReference: ({
      title,
      concepts,
      children,
    }: {
      title: string;
      concepts?: string[];
      children?: React.ReactNode;
    }) => (
      <aside className="my-8 rounded-xl border border-border/70 bg-secondary/55 p-5">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Concept Reference
        </p>
        <h3 className="font-heading mt-1 text-xl font-semibold tracking-tight">
          {title}
        </h3>
        {children ? <div className="mt-3 text-sm text-foreground/85">{children}</div> : null}
        {concepts?.length ? (
          <ul className="mt-3 flex list-none flex-wrap gap-2 pl-0">
            {concepts.map((concept) => (
              <li
                key={concept}
                className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs text-muted-foreground"
              >
                {concept}
              </li>
            ))}
          </ul>
        ) : null}
      </aside>
    ),
    TechnicalDepth: ({
      title,
      children,
    }: {
      title: string;
      children?: React.ReactNode;
    }) => (
      <section className="my-8 rounded-xl border border-border/70 bg-background p-5 shadow-sm">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Technical Depth
        </p>
        <h3 className="font-heading mt-1 text-xl font-semibold tracking-tight">
          {title}
        </h3>
        <div className="mt-3 text-sm text-foreground/85">{children}</div>
      </section>
    ),
    ExplorationBridge: ({
      title,
      href,
      children,
    }: {
      title: string;
      href?: string;
      children?: React.ReactNode;
    }) => (
      <div className="my-8 rounded-xl border border-primary/25 bg-primary/5 p-5">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Exploration Bridge
        </p>
        <h3 className="font-heading mt-1 text-xl font-semibold tracking-tight">
          {href ? (
            <Link href={href} className="text-primary underline-offset-4 hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        {children ? <div className="mt-2 text-sm text-foreground/85">{children}</div> : null}
      </div>
    ),
    ResearchCallout: ({
      title,
      children,
    }: {
      title: string;
      children?: React.ReactNode;
    }) => (
      <div className="my-8 border-l-4 border-primary/70 bg-secondary/35 p-5">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Research Callout
        </p>
        <h3 className="font-heading mt-1 text-lg font-semibold tracking-tight">
          {title}
        </h3>
        <div className="mt-2 text-sm text-foreground/85">{children}</div>
      </div>
    ),
    ReflectionBreak: ({
      prompt,
    }: {
      prompt: string;
    }) => (
      <div className="my-10 rounded-xl border border-border/70 bg-accent/40 px-5 py-6 text-center">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Reflection Break
        </p>
        <p className="font-heading mx-auto mt-2 max-w-2xl text-xl leading-relaxed text-foreground/90">
          {prompt}
        </p>
      </div>
    ),
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
