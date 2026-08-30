"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ variant = "header" }: { variant?: "header" | "ghost" }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  // Avoid hydration mismatch — render placeholder until mounted
  if (!mounted) {
    return (
      <span
        aria-hidden="true"
        className={
          variant === "header"
            ? "w-8 h-8 rounded-[6px] border border-border bg-card"
            : "w-8 h-8 rounded-[6px] border border-border bg-card"
        }
      />
    );
  }

  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={
        variant === "header"
          ? "w-8 h-8 rounded-[6px] border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 active:scale-[0.96]"
          : "w-8 h-8 rounded-[6px] border border-border bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
      }
    >
      <span className="text-xs leading-none" aria-hidden="true">
        {isDark ? "☀" : "◐"}
      </span>
    </button>
  );
}
