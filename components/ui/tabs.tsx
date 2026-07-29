"use client";

import { cn } from "@/lib/utils/cn";

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

/** Controlled tab bar (underline style). */
export function Tabs({ items, value, onValueChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 border-b border-border", className)} role="tablist">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(item.value)}
            className={cn(
              "relative flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className="rounded-full bg-muted px-1.5 text-xs">{item.count}</span>
            )}
            {active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}
