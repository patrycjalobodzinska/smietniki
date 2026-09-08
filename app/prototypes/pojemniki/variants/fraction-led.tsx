"use client";

import { WifiOff } from "lucide-react";
import { FRACTION_LABEL } from "@/lib/labels";
import { fillTone, type WasteFraction } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { CONTAINERS, formatEta, hoursToFull, type ProtoContainer } from "../data";

/**
 * Wariant "Frakcja" - oś: tożsamość odpadu. Kafel przejmuje kolor swojej
 * frakcji, więc rozpoznajesz go jak pojemnik na podwórku: najpierw po kolorze
 * pokrywy, dopiero potem czytasz. Zapełnienie wchodzi pionowo, wzdłuż boku.
 */

/**
 * Kolor pokrywy razem z kolorem napisu - jasne tony (szkło, bio) potrzebują
 * ciemnego tekstu, bo biały na limonce jest nieczytelny.
 */
const FRACTION_SKIN: Record<WasteFraction, { bg: string; text: string; sub: string }> = {
  mixed: { bg: "var(--color-forest)", text: "text-forest-foreground", sub: "text-forest-foreground/70" },
  plastic: { bg: "var(--color-chart-4)", text: "text-white", sub: "text-white/80" },
  paper: { bg: "var(--color-chart-1)", text: "text-white", sub: "text-white/80" },
  glass: { bg: "var(--color-lime)", text: "text-lime-foreground", sub: "text-lime-foreground/70" },
  bio: { bg: "var(--color-chart-6)", text: "text-forest", sub: "text-forest/70" },
  other: { bg: "var(--color-neutral)", text: "text-white", sub: "text-white/80" },
};

const TONE_BG = {
  low: "bg-fill-low",
  mid: "bg-fill-mid",
  high: "bg-fill-high",
  critical: "bg-fill-critical",
} as const;

const TONE_TEXT = {
  low: "text-fill-low",
  mid: "text-fill-mid",
  high: "text-fill-high",
  critical: "text-fill-critical",
} as const;

function Tile({ c, index }: { c: ProtoContainer; index: number }) {
  const level = c.fillLevel;
  const eta = hoursToFull(c);
  const skin = FRACTION_SKIN[c.fraction];

  return (
    <button
      className="proto-rise group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      style={{ animationDelay: `${Math.min(index, 12) * 18}ms` }}
    >
      {/* Pokrywa w kolorze frakcji - pierwszy sygnał rozpoznawczy */}
      <span
        className="flex items-center justify-between gap-2 px-3.5 py-2"
        style={{ background: skin.bg }}
      >
        <span className={cn("truncate text-xs font-semibold", skin.text)}>{FRACTION_LABEL[c.fraction]}</span>
        <span className={cn("shrink-0 text-[11px] font-medium", skin.sub)}>{c.capacityL} l</span>
      </span>

      <span className="flex flex-1 items-stretch gap-3 p-3.5">
        {/* Pionowy słupek zapełnienia wzdłuż boku kafla */}
        <span className="flex w-3 shrink-0 flex-col justify-end overflow-hidden rounded-full bg-muted">
          {level !== null && (
            <span
              className={cn("w-full rounded-full", TONE_BG[fillTone(level)])}
              style={{ height: `${Math.max(4, level)}%` }}
            />
          )}
        </span>

        <span className="flex min-w-0 flex-1 flex-col">
          {level === null ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <WifiOff className="size-3.5" /> N/D
            </span>
          ) : (
            <span className={cn("text-2xl font-bold leading-none tabular-nums", TONE_TEXT[fillTone(level)])}>
              {level}
              <span className="text-xs font-semibold">%</span>
            </span>
          )}
          <span className="mt-1.5 truncate text-xs font-medium">{c.stationName}</span>
          <span className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
            {c.code}
          </span>
          <span className="mt-auto truncate pt-2 text-[11px] text-muted-foreground">
            {eta === null ? "brak prognozy" : `pełny ${formatEta(eta)}`}
          </span>
        </span>
      </span>
    </button>
  );
}

export function FractionLedVariant() {
  const rows = [...CONTAINERS].sort((a, b) => (b.fillLevel ?? -1) - (a.fillLevel ?? -1));
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
      {rows.map((c, i) => (
        <Tile key={c.id} c={c} index={i} />
      ))}
    </div>
  );
}
