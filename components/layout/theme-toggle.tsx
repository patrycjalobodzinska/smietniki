"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/** Theme toggle styled for the forest sidebar rail (with hover/focus tooltip). */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };

  const label = dark ? "Tryb jasny" : "Tryb ciemny";

  return (
    <div className="group relative">
      <button
        onClick={toggle}
        aria-label={label}
        className="flex size-11 items-center justify-center rounded-full text-forest-foreground/70 transition-colors hover:bg-white/10 hover:text-forest-foreground"
      >
        {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-1/2 left-full z-50 ml-3 translate-y-1/2 whitespace-nowrap rounded-lg bg-forest px-2.5 py-1.5 text-xs font-medium text-forest-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}
