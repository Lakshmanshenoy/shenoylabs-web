"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MenuIcon, SearchIcon, XIcon } from "lucide-react";

import Image from "next/image";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools" },
  { href: "/projects", label: "Projects" },
  { href: "/articles", label: "Articles" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];


export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when search expands
  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        {searchOpen ? (
          /* Expanded search row */
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <label htmlFor="global-search" className="sr-only">
              Search across the site
            </label>
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="global-search"
                ref={searchInputRef}
                name="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles and projects..."
                className="h-10 pl-9"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
              aria-label="Close search"
            >
              <XIcon className="size-4" />
            </Button>
          </form>
        ) : (
          /* Normal nav row */
          <div className="flex items-center justify-between">
<Link href="/" className="inline-flex items-center gap-2" aria-label="Shenoy Labs home">
              {/* Light mode icon */}
              <Image
                src="/brand/icon_logo_light.png"
                alt=""
                width={36}
                height={36}
                className="block dark:hidden"
                priority
              />
              {/* Dark mode icon */}
              <Image
                src="/brand/icon_logo_dark.png"
                alt=""
                width={36}
                height={36}
                className="hidden dark:block"
                priority
              />
              <span className="font-heading text-base font-semibold tracking-tight sm:text-lg">
                SHENOY<span className="text-blue-500">LABS</span>
                </span>
              </Link>

            <div className="hidden items-center gap-1 md:flex" role="navigation" aria-label="Main">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    isActive(link.href)
                      ? "bg-secondary font-medium text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
              >
                <SearchIcon className="size-4" />
              </Button>
              <ThemeToggle />
            </div>

            <div className="flex items-center gap-1 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
              >
                <SearchIcon className="size-4" />
              </Button>
              <ThemeToggle />
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger render={<Button variant="ghost" size="icon" />}>
                  <MenuIcon />
                  <span className="sr-only">Open menu</span>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85vw] max-w-xs p-0">
                  <SheetHeader className="border-b border-border px-5 py-4">
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <nav className="grid gap-1 px-3 py-4" aria-label="Main">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        aria-current={isActive(link.href) ? "page" : undefined}
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                          isActive(link.href)
                            ? "bg-secondary font-medium text-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
