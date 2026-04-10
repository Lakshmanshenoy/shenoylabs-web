"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";
const THEME_EVENT = "theme-change";

function resolveThemeFromDocument(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const isDark = theme === "dark";

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      const nextTheme = resolveThemeFromDocument();
      setTheme(nextTheme);
      document.documentElement.style.colorScheme = nextTheme;
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === "theme") {
        syncTheme();
      }
    };
    syncTheme();

    media.addEventListener("change", syncTheme);
    window.addEventListener("storage", onStorage);
    window.addEventListener(THEME_EVENT, syncTheme);

    return () => {
      media.removeEventListener("change", syncTheme);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(THEME_EVENT, syncTheme);
    };
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    window.localStorage.setItem("theme", next);
    setTheme(next);
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
