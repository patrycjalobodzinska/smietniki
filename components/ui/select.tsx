"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  /** Kept event-shaped (`e.target.value`) so existing handlers work unchanged. */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  "aria-label"?: string;
}

/**
 * Custom select — a styled button + popup listbox (no native <select> chrome).
 * Keeps the previous props/API: pass `value`+`onChange` for controlled use, or
 * `defaultValue` for uncontrolled. `onChange` receives a synthetic event so
 * call sites reading `e.target.value` keep working.
 */
export function Select({
  options,
  value,
  defaultValue,
  onChange,
  placeholder,
  invalid,
  disabled,
  id,
  name,
  className,
  "aria-label": ariaLabel,
}: SelectProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = isControlled ? value : internal;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === current);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(v: string) {
    if (!isControlled) setInternal(v);
    onChange?.({ target: { value: v, name } } as unknown as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  }

  return (
    <div ref={ref} className={cn("relative h-10 w-full rounded-xl", className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-full w-full cursor-pointer items-center justify-between gap-2 rounded-[inherit] border border-input bg-card px-3.5 text-left text-sm transition-colors hover:bg-surface-hover focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50",
          invalid && "border-danger focus-visible:border-danger",
        )}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected ? selected.label : placeholder ?? "Wybierz…"}
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-50 mt-2 max-h-64 w-max min-w-full max-w-[min(20rem,calc(100vw-2rem))] overflow-auto rounded-2xl border border-border bg-popover p-1.5 shadow-[var(--shadow-soft)]"
        >
          {options.map((o) => {
            const active = o.value === current;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => choose(o.value)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm transition-colors",
                  active ? "bg-lime/50 font-medium text-forest" : "text-foreground hover:bg-surface-hover",
                )}
              >
                <span>{o.label}</span>
                {active && <Check className="ml-2 size-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
