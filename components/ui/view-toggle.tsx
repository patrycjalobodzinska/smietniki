"use client";

import { LayoutGrid, Rows3 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ListView = "table" | "cards";

const OPTIONS = [
  { value: "table" as const, label: "Tabela", icon: Rows3 },
  { value: "cards" as const, label: "Kafle", icon: LayoutGrid },
];

/** Przełącznik prezentacji listy. Wybór zapamiętuje strona, nie komponent. */
export function ViewToggle({
  value,
  onChange,
  className,
}: {
  value: ListView;
  onChange: (v: ListView) => void;
  className?: string;
}) {
  return (
    <div role="group" aria-label="Widok listy" className={cn("flex items-center gap-0.5 rounded-full bg-muted p-0.5", className)}>
      {OPTIONS.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            title={o.label}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
              active ? "bg-card text-foreground shadow-[var(--shadow-soft)]" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <o.icon className="size-3.5" />
            <span className="hidden sm:inline">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
