"use client";

import { WifiOff, Warehouse, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FRACTION_LABEL } from "@/lib/labels";
import { fillTone, type Container } from "@/lib/types";
import { formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/**
 * Kafel pojemnika - alternatywa dla wiersza tabeli. Ten sam język co kafel
 * altanki: lewa krawędź niesie ton zapełnienia, wartość stoi po prawej u góry,
 * kontekst schodzi na dół. Sortowanie malejące po zapełnieniu jest częścią
 * pomysłu - patrz `sortByFill`.
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

const TONE_EDGE = {
  low: "border-l-fill-low",
  mid: "border-l-fill-mid",
  high: "border-l-fill-high",
  critical: "border-l-fill-critical",
} as const;

/** Malejąco po zapełnieniu; pojemniki bez pomiaru na końcu. */
export function sortByFill(containers: Container[]): Container[] {
  return [...containers].sort((a, b) => (b.fillLevel ?? -1) - (a.fillLevel ?? -1));
}

export interface ContainerCardProps {
  container: Container;
  /** Nazwa altanki - lista pojemników zna tylko `stationId`. */
  stationName: string;
  onClick?: () => void;
  /** Akcja w stopce kafla (np. zmiana zapełnienia). */
  action?: React.ReactNode;
}

export function ContainerCard({ container: c, stationName, onClick, action }: ContainerCardProps) {
  const level = c.fillLevel;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border border-border border-l-[3px] bg-card p-3.5 transition-colors",
        "focus-within:border-ring hover:bg-surface-hover",
        level === null ? "border-l-fill-none" : TONE_EDGE[fillTone(level)],
      )}
    >
      {/* Całą powierzchnię otwiera jeden przycisk pod spodem, żeby akcja
          w stopce nie była zagnieżdżona w drugiej kontrolce. */}
      <button
        type="button"
        onClick={onClick}
        aria-label={`Pojemnik ${c.code}`}
        className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />

      <div className="pointer-events-none relative z-10 flex items-baseline justify-between gap-2">
        <p className="truncate text-[13px] font-semibold">{c.code}</p>
        {level === null ? (
          <span className="shrink-0 text-xs font-medium text-muted-foreground">N/D</span>
        ) : (
          <span className={cn("shrink-0 text-sm font-bold tabular-nums", TONE_TEXT[fillTone(level)])}>
            {Math.round(level)}%
          </span>
        )}
      </div>

      <p className="pointer-events-none relative z-10 mt-0.5 truncate text-xs text-muted-foreground">
        {FRACTION_LABEL[c.fraction]} · {c.capacityL} l
      </p>

      <span className="pointer-events-none relative z-10 mt-3 block h-2 overflow-hidden rounded-full bg-muted">
        {level !== null && (
          <span
            className={cn("block h-full rounded-full", TONE_BG[fillTone(level)])}
            style={{ width: `${Math.max(3, Math.min(100, level))}%` }}
          />
        )}
      </span>

      <div className="relative z-10 mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="pointer-events-none inline-flex min-w-0 flex-1 items-center gap-1">
          <Warehouse className="size-3 shrink-0" />
          <span className="truncate">{stationName}</span>
        </span>
        <span className="pointer-events-none inline-flex shrink-0 items-center gap-1">
          {level === null ? (
            <>
              <WifiOff className="size-3" /> brak czujnika
            </>
          ) : c.predictedFullAt ? (
            <>
              <Clock className="size-3" /> {formatRelative(c.predictedFullAt)}
            </>
          ) : null}
        </span>
        {action && <span className="shrink-0">{action}</span>}
      </div>
    </div>
  );
}

/** Kafel w stanie ładowania - ta sama wysokość co realny. */
export function ContainerCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border border-l-[3px] border-l-muted bg-card p-3.5">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-2 h-3 w-24" />
      <Skeleton className="mt-3 h-2 w-full" />
      <Skeleton className="mt-3 h-3 w-36" />
    </div>
  );
}
