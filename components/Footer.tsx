import Link from 'next/link';
import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-white/80">
      <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-sm font-semibold text-foreground">Shenoy Labs</div>
          <div className="mt-2 text-sm text-muted">Thoughtful tools, practical intelligence.</div>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/support" className="text-sm text-muted hover:text-primary">
            Support
          </Link>
          <a
            href="https://github.com/lakshmanshenoy"
            className="text-sm text-muted hover:text-primary"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
