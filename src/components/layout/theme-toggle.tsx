"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";
const THEME_EVENT = "theme-change";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onThemeChange = () => callback();
  const onStorage = (event: StorageEvent) => {
    if (event.key === "theme") callback();
  };

  media.addEventListener("change", callback);
  window.addEventListener("storage", onStorage);
  window.addEventListener(THEME_EVENT, onThemeChange);

  return () => {
    media.removeEventListener("change", callback);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(THEME_EVENT, onThemeChange);
  };
}

function getSnapshot(): Theme {
  return getInitialTheme();
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem("theme", next);
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className="text-muted-foreground"
    >
      {isDark ? (
        <SunIcon className="size-4" />
      ) : (
        <MoonIcon className="size-4" />
      )}
    </Button>
  );
}
