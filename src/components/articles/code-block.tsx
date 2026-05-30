"use client";

import type React from "react";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

// Extract all text from React node tree (handles nested code elements)
function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in children) {
    const el = children as React.ReactElement<{ children?: React.ReactNode }>;
    return extractText(el.props?.children);
  }
  return "";
}

export function CodeBlock({
  className,
  children,
  ...props
}: React.ComponentProps<"pre">) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = extractText(children);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative mb-5">
      <pre
        className={cn(
          "overflow-x-auto rounded-xl border border-border/70 bg-muted p-5 text-sm leading-relaxed",
          className,
        )}
        {...props}
      >
        {children}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy code to clipboard"
        className={cn(
          "absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold backdrop-blur-sm transition-all duration-150",
          "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          copied
            ? "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400"
            : "border-border/70 bg-background/80 text-muted-foreground hover:border-border hover:text-foreground",
        )}
      >
        {copied ? (
          <>
            <Check className="size-3" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="size-3" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}
