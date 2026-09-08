"use client";

import { WifiOff, Warehouse, Clock } from "lucide-react";
import { FRACTION_LABEL } from "@/lib/labels";
import { fillTone } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { CONTAINERS, formatEta, hoursToFull, type ProtoContainer } from "../data";

/**
 * Wariant "Zgodny" - oś: spójność z resztą systemu. Ten sam język co kafle
 * altanek: lewa krawędź w tonie zapełnienia, kod u góry, wartość po prawej,
 * kontekst na dole. Nic nowego do nauczenia się.
 */

const TONE_EDGE = {
  low: "border-l-fill-low",
  mid: "border-l-fill-mid",
  high: "border-l-fill-high",
  critical: "border-l-fill-critical",
} as const;

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

  return (
    <button
      className={cn(
        "proto-rise group flex flex-col rounded-2xl border border-border border-l-[3px] bg-card p-3.5 text-left transition-colors",
        "hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        level === null ? "border-l-fill-none" : TONE_EDGE[fillTone(level)],
      )}
      style={{ animationDelay: `${Math.min(index, 12) * 18}ms` }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-[13px] font-semibold">{c.code}</p>
        {level === null ? (
          <span className="shrink-0 text-xs font-medium text-muted-foreground">N/D</span>
        ) : (
          <span className={cn("shrink-0 text-sm font-bold tabular-nums", TONE_TEXT[fillTone(level)])}>
            {level}%
          </span>
        )}
      </div>

      <p className="mt-0.5 truncate text-xs text-muted-foreground">
        {FRACTION_LABEL[c.fraction]} · {c.capacityL} l
      </p>

      <span className="mt-3 block h-2 overflow-hidden rounded-full bg-muted">
        {level !== null && (
          <span
            className={cn("block h-full rounded-full", TONE_BG[fillTone(level)])}
            style={{ width: `${Math.max(3, level)}%` }}
          />
        )}
      </span>

      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground [&>span]:inline-flex [&>span]:min-w-0 [&>span]:items-center [&>span]:gap-1">
        <span className="flex-1">
          <Warehouse className="size-3 shrink-0" />
          <span className="truncate">{c.stationName}</span>
        </span>
        <span className="shrink-0">
          {eta === null ? (
            <>
              <WifiOff className="size-3" /> brak czujnika
            </>
          ) : (
            <>
              <Clock className="size-3" /> {formatEta(eta)}
            </>
          )}
        </span>
      </div>
    </button>
  );
}

export function ConsistentVariant() {
  const rows = [...CONTAINERS].sort((a, b) => (b.fillLevel ?? -1) - (a.fillLevel ?? -1));
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {rows.map((c, i) => (
        <Tile key={c.id} c={c} index={i} />
      ))}
    </div>
  );
}
