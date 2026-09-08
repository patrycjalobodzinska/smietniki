"use client";

import { WifiOff } from "lucide-react";
import { FRACTION_LABEL } from "@/lib/labels";
import { fillTone } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { CONTAINERS, formatEta, hoursToFull, type ProtoContainer } from "../data";

/**
 * Wariant "Miernik" - oś: dominacja jednej wartości. Kafel jest w całości
 * podporządkowany procentowi: pierścień i duża liczba wchodzą pierwsze,
 * reszta to podpis. Lista czyta się jak tablica wskaźników, nie jak spis.
 */

const TONE_VAR = {
  low: "var(--color-fill-low)",
  mid: "var(--color-fill-mid)",
  high: "var(--color-fill-high)",
  critical: "var(--color-fill-critical)",
} as const;

const TONE_TEXT = {
  low: "text-fill-low",
  mid: "text-fill-mid",
  high: "text-fill-high",
  critical: "text-fill-critical",
} as const;

function Ring({ level }: { level: number | null }) {
  const tone = level === null ? null : fillTone(level);
  const color = tone ? TONE_VAR[tone] : "var(--color-fill-none)";
  const deg = level === null ? 0 : (level / 100) * 360;

  return (
    <div className="relative mx-auto size-[92px]">
      <div
        className="proto-ring size-full rounded-full"
        style={{ background: `conic-gradient(${color} ${deg}deg, var(--color-muted) ${deg}deg)` }}
      />
      <div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-full bg-card">
        {level === null ? (
          <WifiOff className="size-5 text-muted-foreground" />
        ) : (
          <span className={cn("text-2xl font-bold leading-none tabular-nums", TONE_TEXT[fillTone(level)])}>
            {level}
            <span className="text-xs font-semibold">%</span>
          </span>
        )}
      </div>
    </div>
  );
}

function Tile({ c, index }: { c: ProtoContainer; index: number }) {
  const eta = hoursToFull(c);

  return (
    <button
      className="proto-rise group flex flex-col rounded-2xl border border-border bg-card p-4 text-center transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      style={{ animationDelay: `${Math.min(index, 12) * 18}ms` }}
    >
      <Ring level={c.fillLevel} />
      <p className="mt-3 truncate text-sm font-semibold">{FRACTION_LABEL[c.fraction]}</p>
      <p className="mt-0.5 truncate text-[11px] uppercase tracking-wide text-muted-foreground">
        {c.code}
      </p>
      <p className="mt-2 truncate border-t border-border pt-2 text-[11px] text-muted-foreground">
        {c.stationName}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
        {eta === null ? `${c.capacityL} l · brak prognozy` : `pełny ${formatEta(eta)}`}
      </p>
    </button>
  );
}

export function GaugeVariant() {
  const rows = [...CONTAINERS].sort((a, b) => (b.fillLevel ?? -1) - (a.fillLevel ?? -1));
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">
      {rows.map((c, i) => (
        <Tile key={c.id} c={c} index={i} />
      ))}
    </div>
  );
}
