"use client";

import { Camera, Truck, ChevronRight } from "lucide-react";
import { FRACTION_LABEL } from "@/lib/labels";
import { fillTone } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { STATIONS, shortTime, type ProtoStation } from "../data";

/**
 * Wariant "Pilność" - oś: kolejność pracy. Bez pasm i nagłówków: jeden ciąg
 * kafli od najbardziej zapełnionej altanki w dół, więc to, co pilne, jest
 * zawsze na górze. Pilność niesie sam kafel (krawędź + wartość), nie kolumna.
 */

const TONE_BG = {
  low: "bg-fill-low",
  mid: "bg-fill-mid",
  high: "bg-fill-high",
  critical: "bg-fill-critical",
} as const;

// Klasy muszą być literałami - Tailwind skanuje źródło, `text-fill-${...}` nie
// zostałoby wygenerowane.
const TONE_TEXT = {
  low: "text-fill-low",
  mid: "text-fill-mid",
  high: "text-fill-high",
  critical: "text-fill-critical",
} as const;

// Akcent jako lewa krawędź obramowania - podąża za border-radius i zakręca
// w rogach, czego przycinany pasek (::before + overflow-hidden) nie robi.
const TONE_EDGE = {
  low: "border-l-fill-low",
  mid: "border-l-fill-mid",
  high: "border-l-fill-high",
  critical: "border-l-fill-critical",
} as const;

/** Szczyt zapełnienia - altanki bez telemetrii lądują na końcu (-1). */
function peakOf(s: ProtoStation): number {
  const measured = s.containers.filter((c) => typeof c.fillLevel === "number");
  return measured.length ? Math.max(...measured.map((c) => c.fillLevel as number)) : -1;
}

function StationCard({ s, index }: { s: ProtoStation; index: number }) {
  const measured = s.containers.filter((c) => typeof c.fillLevel === "number");
  const peak = measured.length ? Math.max(...measured.map((c) => c.fillLevel as number)) : null;
  const worst = measured.find((c) => c.fillLevel === peak);

  return (
    <button
      className={cn(
        "proto-rise group relative w-full rounded-2xl border border-border border-l-[3px] bg-card p-3.5 text-left transition-colors",
        "hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        peak === null ? "border-l-fill-none" : TONE_EDGE[fillTone(peak)],
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 28}ms` }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-sm font-semibold">{s.name}</p>
        {peak !== null && (
          <span className={cn("shrink-0 text-sm font-bold tabular-nums", TONE_TEXT[fillTone(peak)])}>
            {peak}%
          </span>
        )}
      </div>
      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        {s.code} · {s.district}
      </p>

      {/* Pojemniki jako segmenty - szerokość równa, wysokość = wypełnienie */}
      <div className="mt-3 flex h-9 items-end gap-1">
        {s.containers.map((c) => {
          const v = c.fillLevel;
          return (
            <div
              key={c.id}
              title={`${FRACTION_LABEL[c.fraction]}: ${v === null ? "brak pomiaru" : `${v}%`}`}
              className="flex-1 rounded-[3px] bg-muted"
              style={{ height: "100%" }}
            >
              <div className="flex h-full flex-col justify-end">
                <div
                  className={cn(
                    "rounded-[3px] transition-[height] duration-300 ease-out",
                    v === null ? "bg-fill-none/50" : TONE_BG[fillTone(v)],
                  )}
                  style={{ height: v === null ? "12%" : `${Math.max(6, v)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {s.hasCamera && <Camera className="size-3.5 text-info" />}
          <span>{s.openings24h} otwarć</span>
          <span aria-hidden>·</span>
          <span>{shortTime(s.lastSessionAt)}</span>
        </div>
        {worst && peak !== null && peak >= 90 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-coral/12 px-2 py-0.5 text-[11px] font-semibold text-coral">
            <Truck className="size-3" />
            {FRACTION_LABEL[worst.fraction]}
          </span>
        ) : (
          <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>
    </button>
  );
}

export function TriageVariant() {
  const rows = [...STATIONS].sort((a, b) => peakOf(b) - peakOf(a));
  const urgent = rows.filter((s) => peakOf(s) >= 90).length;

  return (
    <div className="space-y-3">
      <p className="px-1 text-xs text-muted-foreground">
        Od najbardziej zapełnionych.{" "}
        {urgent > 0 && (
          <span className="font-semibold text-fill-critical">
            {urgent} {urgent === 1 ? "altanka wymaga" : "altanki wymagają"} odbioru dziś.
          </span>
        )}{" "}
        Altanki bez telemetrii na końcu.
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {rows.map((s, i) => (
          <StationCard key={s.id} s={s} index={i} />
        ))}
      </div>
    </div>
  );
}
