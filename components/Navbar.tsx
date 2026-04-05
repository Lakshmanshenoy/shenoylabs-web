"use client";

import Link from "next/link";
import React, { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-primary inline-block py-1 px-2">
          Shenoy Labs
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/" className="text-sm text-muted hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
            Home
          </Link>
          <Link href="/tools" className="text-sm text-muted hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
            Tools
          </Link>
          <Link href="/projects" className="text-sm text-muted hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
            Projects
          </Link>
          <Link href="/articles" className="text-sm text-muted hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
            Articles
          </Link>
          <Link href="/about" className="text-sm text-muted hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
            About
          </Link>
          <Link href="/contact" className="text-sm text-muted hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
            Contact
          </Link>
          <Link
            href="/support"
            className="ml-4 inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Support
          </Link>
        </nav>

        <div className="md:hidden">
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
            className="text-sm text-muted hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-white/95">
          <div className="mx-auto max-w-5xl px-6 py-4 flex flex-col gap-3">
            <Link href="/" className="text-sm text-foreground hover:text-primary" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link href="/tools" className="text-sm text-foreground hover:text-primary" onClick={() => setOpen(false)}>
              Tools
            </Link>
            <Link href="/projects" className="text-sm text-foreground hover:text-primary" onClick={() => setOpen(false)}>
              Projects
            </Link>
            <Link href="/articles" className="text-sm text-foreground hover:text-primary" onClick={() => setOpen(false)}>
              Articles
            </Link>
            <Link href="/about" className="text-sm text-foreground hover:text-primary" onClick={() => setOpen(false)}>
              About
            </Link>
            <Link href="/contact" className="text-sm text-foreground hover:text-primary" onClick={() => setOpen(false)}>
              Contact
            </Link>
            <Link href="/support" className="mt-2 inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-400" onClick={() => setOpen(false)}>
              Support
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
