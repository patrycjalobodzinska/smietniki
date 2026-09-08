"use client";

import { useState } from "react";
import { Camera, KeyRound, Truck, MapPin, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VariantBadge, StationStatusBadge } from "@/components/domain/badges";
import { FRACTION_LABEL } from "@/lib/labels";
import { fillTone } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { STATIONS, shortTime, type ProtoStation } from "../data";

/**
 * Wariant "Kafle" - oś: charakter. Altanka dostaje portret: pierścień
 * zapełnienia jako punkt wejścia dla oka, pod nim rozbicie na frakcje.
 * Najmniej wierszy na ekran, najkrótsza droga do "co się dzieje w tym miejscu".
 */

const TONE_VAR = {
  low: "var(--color-fill-low)",
  mid: "var(--color-fill-mid)",
  high: "var(--color-fill-high)",
  critical: "var(--color-fill-critical)",
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

function Ring({ level }: { level: number | null }) {
  const tone = level === null ? null : fillTone(level);
  const color = tone ? TONE_VAR[tone] : "var(--color-fill-none)";
  const deg = level === null ? 0 : (level / 100) * 360;
  return (
    <div className="relative size-[68px] shrink-0">
      <div
        className="proto-ring size-full rounded-full"
        style={{
          background: `conic-gradient(${color} ${deg}deg, var(--color-muted) ${deg}deg)`,
        }}
      />
      <div className="absolute inset-[7px] flex flex-col items-center justify-center rounded-full bg-card">
        {level === null ? (
          <span className="text-[11px] font-semibold text-muted-foreground">N/D</span>
        ) : (
          <span className={cn("text-lg font-bold leading-none tabular-nums", TONE_TEXT[fillTone(level)])}>
            {level}
            <span className="text-[10px] font-semibold">%</span>
          </span>
        )}
      </div>
    </div>
  );
}

function StationTile({ s, index }: { s: ProtoStation; index: number }) {
  const [reported, setReported] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <article
      className="proto-rise group flex flex-col rounded-[var(--radius)] border border-border bg-card p-5 transition-shadow hover:shadow-[var(--shadow-soft)]"
      style={{ animationDelay: `${Math.min(index, 9) * 30}ms` }}
    >
      <div className="flex items-start gap-4">
        <Ring level={s.avgFillLevel} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="truncate text-[15px] font-semibold leading-tight">{s.name}</h2>
            <StationStatusBadge status={s.status} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{s.district}</span>
            <span aria-hidden>·</span>
            <span className="uppercase">{s.code}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <VariantBadge variant={s.deploymentVariant} />
          </div>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5">
        {s.containers.map((c) => (
          <li key={c.id} className="flex items-center gap-2.5">
            <span className="w-[4.5rem] shrink-0 text-[11px] text-muted-foreground">{FRACTION_LABEL[c.fraction]}</span>
            <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
              <span
                className={cn("block h-full rounded-full", c.fillLevel === null ? "bg-fill-none/40" : TONE_BG[fillTone(c.fillLevel)])}
                style={{ width: c.fillLevel === null ? "100%" : `${Math.max(3, c.fillLevel)}%` }}
              />
            </span>
            <span className="w-8 shrink-0 text-right text-[11px] font-semibold tabular-nums text-muted-foreground">
              {c.fillLevel === null ? "-" : `${c.fillLevel}%`}
            </span>
          </li>
        ))}
      </ul>

      {/* Rozwijane szczegóły - zamiast przeskoku na osobną stronę */}
      <div
        id={`det-${s.id}`}
        hidden={!open}
        className="mt-3 rounded-xl bg-muted/60 p-3 text-[11px] text-muted-foreground"
      >
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <dt>Adres</dt>
          <dd className="text-right font-medium text-foreground">{s.address}</dd>
          <dt>Pojemniki</dt>
          <dd className="text-right font-medium text-foreground tabular-nums">{s.containerCount}</dd>
          <dt>Otwarcia / 24 h</dt>
          <dd className="text-right font-medium text-foreground tabular-nums">{s.openings24h}</dd>
          <dt>Ostatnie wejście</dt>
          <dd className="text-right font-medium text-foreground">{shortTime(s.lastSessionAt)}</dd>
          <dt>Ostatni odbiór</dt>
          <dd className="text-right font-medium text-foreground">{shortTime(s.lastCollectionAt)}</dd>
        </dl>
      </div>

      <footer className="mt-auto pt-4">
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground [&>span]:inline-flex [&>span]:items-center [&>span]:gap-1">
          <span><KeyRound className="size-3" />{s.openings24h} otwarć</span>
          <span><Truck className="size-3" />{shortTime(s.lastCollectionAt)}</span>
          {s.hasCamera && <span className="text-info"><Camera className="size-3" />podgląd</span>}
        </div>
        <div className="flex items-center gap-2 border-t border-border pt-3">
          <Button
            size="sm"
            variant={reported ? "secondary" : "primary"}
            onClick={() => setReported((r) => !r)}
            className="flex-1"
            aria-live="polite"
          >
            {reported ? (
              <>
                <Check className="size-4" />
                Zgłoszone
              </>
            ) : (
              <>
                <Truck className="size-4" />
                Zgłoś odbiór
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={`det-${s.id}`}
          >
            Szczegóły
            <ChevronDown
              className={cn("transition-transform duration-200 ease-out", open && "rotate-180")}
            />
          </Button>
        </div>
      </footer>
    </article>
  );
}

export function CardsVariant() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {STATIONS.map((s, i) => (
        <StationTile key={s.id} s={s} index={i} />
      ))}
    </div>
  );
}
