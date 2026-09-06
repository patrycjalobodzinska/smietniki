"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useAnchoredPopover } from "@/components/ui/use-anchored-popover";
import { cn } from "@/lib/utils/cn";

/**
 * Kalendarz w stylu aplikacji - zamiast natywnego `<input type="date">`, który
 * w każdej przeglądarce wygląda inaczej i nie da się go ostylować.
 *
 * Wartość zostaje w formatach natywnych (`YYYY-MM-DD`, a z `withTime`
 * `YYYY-MM-DDTHH:mm`), a `onChange` dostaje zdarzenie o kształcie inputa, więc
 * istniejące `e.target.value` działa bez zmian - tak samo jak w `Select`.
 */

const WEEKDAYS = ["pn", "wt", "śr", "cz", "pt", "so", "nd"];
const MONTHS = [
  "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec",
  "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień",
];

const pad = (n: number) => String(n).padStart(2, "0");
const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Parsuje bez stref czasowych - `new Date("2026-09-05")` to UTC i potrafi cofnąć o dzień. */
function parseValue(value: string): { date: Date | null; time: string } {
  const [datePart, timePart = ""] = value.split("T");
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart ?? "");
  if (!m) return { date: null, time: timePart.slice(0, 5) };
  return {
    date: new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])),
    time: timePart.slice(0, 5),
  };
}

function formatLabel(date: Date, time: string, withTime: boolean): string {
  const base = `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
  return withTime && time ? `${base}, ${time}` : base;
}

/** Siatka 6×7 od poniedziałku - zawsze pełne tygodnie, żeby popover nie skakał. */
function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // pn = 0
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

export interface DatePickerProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Dokłada pole godziny i przełącza format na `YYYY-MM-DDTHH:mm`. */
  withTime?: boolean;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  "aria-label"?: string;
}

export function DatePicker({
  value = "",
  onChange,
  withTime = false,
  placeholder = withTime ? "Wybierz datę i godzinę…" : "Wybierz datę…",
  invalid,
  disabled,
  id,
  name,
  className,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const { date: selected, time } = useMemo(() => parseValue(value), [value]);
  const [open, setOpen] = useState(false);
  // Kalendarz w portalu z pozycją `fixed`: inaczej `overflow-y: auto` modala
  // przycinałby go i wymuszał przewijanie panelu. Kierunek wybiera się sam,
  // zależnie od miejsca nad i pod polem.
  const { anchorRef, popoverRef, style, place } = useAnchoredPopover(open, withTime ? 400 : 344);

  // Miesiąc widoczny w popoverze. Ustawiany przy otwieraniu (nie w efekcie),
  // żeby przewinięcie miesięcy zostało do czasu zamknięcia.
  const [view, setView] = useState(() => selected ?? new Date());

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      // Panel leży w portalu, więc musi być w teście osobno od kontrolki.
      if (anchorRef.current?.contains(t) || popoverRef.current?.contains(t)) return;
      setOpen(false);
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
  }, [open, anchorRef, popoverRef]);

  function emit(next: string) {
    onChange?.({ target: { value: next, name } } as unknown as React.ChangeEvent<HTMLInputElement>);
  }

  function chooseDay(d: Date) {
    const iso = toISODate(d);
    emit(withTime ? `${iso}T${time || "12:00"}` : iso);
    if (!withTime) setOpen(false);
  }

  function chooseTime(t: string) {
    const iso = selected ? toISODate(selected) : toISODate(new Date());
    emit(t ? `${iso}T${t}` : iso);
  }

  const today = new Date();
  const isToday = (d: Date) => toISODate(d) === toISODate(today);
  const isSelected = (d: Date) => !!selected && toISODate(d) === toISODate(selected);
  const days = useMemo(() => monthGrid(view.getFullYear(), view.getMonth()), [view]);

  return (
    <div ref={anchorRef} className={cn("relative h-10 w-full rounded-xl", className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        onClick={() => {
          if (!open) {
            setView(selected ?? new Date());
            place();
          }
          setOpen((o) => !o);
        }}
        className={cn(
          "flex h-full w-full cursor-pointer items-center gap-2 rounded-[inherit] border border-input bg-card px-3.5 text-left text-sm transition-colors hover:bg-surface-hover focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50",
          selected && !disabled && "pr-9",
          invalid && "border-danger focus-visible:border-danger",
        )}
      >
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected ? formatLabel(selected, time, withTime) : placeholder}
        </span>
      </button>

      {/* Osobny przycisk, nie zagnieżdżony w triggerze - zagnieżdżanie
          kontrolek jest nieprawidłowe i psuje nawigację klawiaturą. */}
      {selected && !disabled && (
        <button
          type="button"
          aria-label="Wyczyść datę"
          onClick={() => emit("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <X className="size-3.5" />
        </button>
      )}

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Kalendarz"
            style={style}
            className="z-[100] w-[17.5rem] overflow-auto rounded-2xl border border-border bg-popover p-3 shadow-[var(--shadow-soft)]"
          >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Poprzedni miesiąc"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <p className="text-sm font-semibold capitalize">
              {MONTHS[view.getMonth()]} {view.getFullYear()}
            </p>
            <button
              type="button"
              aria-label="Następny miesiąc"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1 text-center text-[11px] font-medium text-muted-foreground">
                {w}
              </span>
            ))}
            {days.map((d) => {
              const outside = d.getMonth() !== view.getMonth();
              const sel = isSelected(d);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => chooseDay(d)}
                  aria-current={sel ? "date" : undefined}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl text-sm tabular-nums transition-colors",
                    sel
                      ? "bg-lime font-semibold text-lime-foreground"
                      : outside
                        ? "text-muted-foreground/50 hover:bg-surface-hover"
                        : "text-foreground hover:bg-surface-hover",
                    !sel && isToday(d) && "font-semibold text-primary",
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          {withTime && (
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              <label htmlFor={`${id ?? name ?? "dp"}-time`} className="text-xs text-muted-foreground">
                Godzina
              </label>
              <input
                id={`${id ?? name ?? "dp"}-time`}
                type="time"
                value={time}
                onChange={(e) => chooseTime(e.target.value)}
                className="ml-auto h-8 rounded-lg border border-input bg-background px-2 text-sm tabular-nums focus-visible:border-ring"
              />
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => chooseDay(new Date())}
              className="rounded-full px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-surface-hover"
            >
              Dziś
            </button>
            <button
              type="button"
              onClick={() => {
                emit("");
                setOpen(false);
              }}
              className="rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              Wyczyść
            </button>
          </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
