"use client";

import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-indigo-600">
          Shenoy Labs
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/" className="text-sm text-zinc-700 hover:text-indigo-600">
            Home
          </Link>
          <Link href="/tools" className="text-sm text-zinc-700 hover:text-indigo-600">
            Tools
          </Link>
          <Link href="/projects" className="text-sm text-zinc-700 hover:text-indigo-600">
            Projects
          </Link>
          <Link href="/articles" className="text-sm text-zinc-700 hover:text-indigo-600">
            Articles
          </Link>
          <Link href="/about" className="text-sm text-zinc-700 hover:text-indigo-600">
            About
          </Link>
          <Link href="/contact" className="text-sm text-zinc-700 hover:text-indigo-600">
            Contact
          </Link>
          <Link
            href="/support"
            className="ml-4 inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Support
          </Link>
        </nav>

        <div className="md:hidden">
          <Link href="/tools" className="text-sm text-zinc-700 hover:text-indigo-600">
            Menu
          </Link>
        </div>
      </div>
    </header>
  );
}
