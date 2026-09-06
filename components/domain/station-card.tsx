"use client";

import { Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { VariantBadge, StationStatusBadge } from "@/components/domain/badges";
import { FRACTION_LABEL } from "@/lib/labels";
import { fillTone, type BinStation, type Container } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

/**
 * Kafel altanki - alternatywa dla wiersza tabeli. Pilność niesie lewa krawędź
 * (ton szczytowego pojemnika) i wartość szczytu, a nie pozycja w tabeli, więc
 * kafle mają sens tylko posortowane malejąco - patrz `sortByPeakFill`.
 */

const TONE_BG = {
  low: "bg-fill-low",
  mid: "bg-fill-mid",
  high: "bg-fill-high",
  critical: "bg-fill-critical",
} as const;

// Klasy muszą być literałami - Tailwind skanuje źródło, `text-fill-${...}`
// nie zostałoby wygenerowane.
const TONE_TEXT = {
  low: "text-fill-low",
  mid: "text-fill-mid",
  high: "text-fill-high",
  critical: "text-fill-critical",
} as const;

// Akcent jako lewa krawędź obramowania - podąża za border-radius i zakręca
// w rogach, czego przycinany pasek (::before + overflow-hidden) nie robi.
// Grubość 3px: czytelna jako sygnał, ale nie przejmuje kafla.
const TONE_EDGE = {
  low: "border-l-fill-low",
  mid: "border-l-fill-mid",
  high: "border-l-fill-high",
  critical: "border-l-fill-critical",
} as const;

/** Minimalna liczba miejsc w torze słupków - patrz komentarz przy renderze. */
const MIN_SLOTS = 4;

/** Najwyższe zapełnienie wśród pojemników; null gdy żaden nie ma pomiaru. */
export function peakFill(containers: Container[]): number | null {
  const measured = containers.filter((c) => typeof c.fillLevel === "number");
  return measured.length ? Math.max(...measured.map((c) => c.fillLevel as number)) : null;
}

/** Malejąco po szczycie; altanki bez telemetrii na końcu. */
export function sortByPeakFill(stations: BinStation[], byStation: Map<string, Container[]>): BinStation[] {
  const key = (s: BinStation) => peakFill(byStation.get(s.id) ?? []) ?? s.avgFillLevel ?? -1;
  return [...stations].sort((a, b) => key(b) - key(a));
}

export interface StationCardProps {
  station: BinStation;
  containers: Container[];
  onClick?: () => void;
}

export function StationCard({ station, containers, onClick }: StationCardProps) {
  const peak = peakFill(containers) ?? station.avgFillLevel;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full flex-col rounded-2xl border border-border border-l-[3px] bg-card p-3.5 text-left transition-colors",
        "hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        peak === null ? "border-l-fill-none" : TONE_EDGE[fillTone(peak)],
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-sm font-semibold">{station.name}</p>
        {peak === null ? (
          <span className="shrink-0 text-xs font-medium text-muted-foreground">N/D</span>
        ) : (
          <span className={cn("shrink-0 text-sm font-bold tabular-nums", TONE_TEXT[fillTone(peak)])}>
            {Math.round(peak)}%
          </span>
        )}
      </div>
      <p className="mt-0.5 truncate text-[11px] uppercase tracking-wide text-muted-foreground">
        {station.code}
        {station.district && ` · ${station.district}`}
      </p>

      {/* Pojemnik = słupek, wysokość słupka to zapełnienie. Tor ma zawsze co
          najmniej MIN_SLOTS miejsc, więc słupek zawsze znaczy tyle samo
          szerokości - altanka z jednym pojemnikiem nie dostaje bloku na całą
          szerokość kafla, a skala jest porównywalna między kaflami. */}
      <div className="mt-3 flex h-9 items-stretch gap-1">
        {containers.length === 0 ? (
          <div className="flex w-full items-center rounded-[3px] bg-muted px-2 text-[10px] text-muted-foreground">
            {station.containerCount === 0 ? "brak pojemników" : `${station.containerCount} pojemników`}
          </div>
        ) : (
          containers.map((c) => (
            <div
              key={c.id}
              title={`${FRACTION_LABEL[c.fraction]}: ${c.fillLevel === null ? "brak pomiaru" : `${Math.round(c.fillLevel)}%`}`}
              className="flex flex-1 flex-col justify-end rounded-[3px] bg-muted"
            >
              <div
                className={cn(
                  "rounded-[3px]",
                  c.fillLevel === null ? "bg-fill-none/50" : TONE_BG[fillTone(c.fillLevel)],
                )}
                style={{ height: c.fillLevel === null ? "12%" : `${Math.max(6, Math.min(100, c.fillLevel))}%` }}
              />
            </div>
          ))
        )}
        {containers.length > 0 &&
          Array.from({ length: Math.max(0, MIN_SLOTS - containers.length) }).map((_, i) => (
            <div key={`pad-${i}`} className="flex-1" aria-hidden />
          ))}
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <VariantBadge variant={station.deploymentVariant} />
        {station.hasCamera && <Camera className="size-3.5 shrink-0 text-info" />}
        <span className="ml-auto shrink-0">
          <StationStatusBadge status={station.status} />
        </span>
      </div>
    </button>
  );
}

/** Siatka kafli w stanie ładowania - ta sama wysokość co realny kafel. */
export function StationCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border border-l-[3px] border-l-muted bg-card p-3.5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-2 h-3 w-24" />
      <Skeleton className="mt-3 h-9 w-full" />
      <Skeleton className="mt-3 h-5 w-28" />
    </div>
  );
}
