"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try { localStorage.setItem("roam.theme", next); } catch {}
  }

  if (!mounted) return <div className="h-8 w-8" />;

  return (
    <button
      onClick={toggle}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] glass text-[var(--fg)] hover:border-[var(--gold-400)] focus-ring transition-all duration-200 text-sm"
    >
      <span className="transition-transform duration-200" style={{ display: "inline-block", transform: theme === "dark" ? "rotate(-15deg)" : "rotate(0deg)" }}>
        {theme === "dark" ? "\u2600" : "\u263E"}
      </span>
    </button>
  );
}
