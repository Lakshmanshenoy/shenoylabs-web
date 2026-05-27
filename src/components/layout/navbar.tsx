"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MenuIcon, SearchIcon, XIcon } from "lucide-react";

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
  { href: "/articles", label: "Investigations" },
  { href: "/projects", label: "Projects" },
  { href: "/concepts", label: "Concepts" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    if (!searchQuery.trim()) return;

    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery("");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/65 bg-background/88 backdrop-blur-md">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        {searchOpen ? (
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <label htmlFor="global-search" className="sr-only">
              Search across investigations, projects, and concepts
            </label>
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="global-search"
                ref={searchInputRef}
                name="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the inquiry landscape"
                className="h-10 border-border/70 bg-card pl-9"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
              aria-label="Close search"
            >
              <XIcon className="size-4" />
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2" aria-label="Shenoy Labs home">
              <Image
                src="/brand/icon_logo_light.png"
                alt=""
                width={30}
                height={30}
                className="block dark:hidden"
                priority
              />
              <Image
                src="/brand/icon_logo_dark.png"
                alt=""
                width={30}
                height={30}
                className="hidden dark:block"
                priority
              />
              <span className="font-heading text-lg tracking-[0.01em]">Shenoy Labs</span>
            </Link>

            <div className="hidden items-center gap-4 md:flex" role="navigation" aria-label="Main">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "text-sm transition-colors",
                    isActive(link.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} aria-label="Open search">
                <SearchIcon className="size-4" />
              </Button>
              <ThemeToggle />
            </div>

            <div className="flex items-center gap-1 md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} aria-label="Open search">
                <SearchIcon className="size-4" />
              </Button>
              <ThemeToggle />
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
                  <MenuIcon className="size-4" />
                  <span className="sr-only">Open menu</span>
                </SheetTrigger>
                <SheetContent side="right" className="w-[82vw] max-w-xs p-0">
                  <SheetHeader className="border-b border-border/70 px-5 py-4">
                    <SheetTitle>Explore</SheetTitle>
                  </SheetHeader>
                  <nav className="grid gap-1 px-3 py-4" aria-label="Main">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        aria-current={isActive(link.href) ? "page" : undefined}
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive(link.href)
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
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
