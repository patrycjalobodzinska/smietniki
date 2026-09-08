"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { FRACTION_LABEL } from "@/lib/labels";
import { fillTone } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { STATIONS, shortTime, type ProtoStation } from "../data";

/**
 * Wariant "Puls" - oś: gęstość. Jedna altanka to jedna linia, a treścią linii
 * jest sam pomiar: pasmo segmentów per pojemnik. Czyta się kolorem, nie
 * czytaniem komórek - cały stan sieci wchodzi na jeden ekran bez przewijania.
 */

const TONE_BG = {
  low: "bg-fill-low",
  mid: "bg-fill-mid",
  high: "bg-fill-high",
  critical: "bg-fill-critical",
} as const;

const SORTS = [
  { key: "peak", label: "wg szczytu" },
  { key: "district", label: "wg dzielnicy" },
  { key: "code", label: "wg kodu" },
] as const;

function peakOf(s: ProtoStation): number {
  const measured = s.containers.filter((c) => typeof c.fillLevel === "number");
  return measured.length ? Math.max(...measured.map((c) => c.fillLevel as number)) : -1;
}

export function PulseVariant() {
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("peak");

  const rows = [...STATIONS].sort((a, b) => {
    if (sort === "peak") return peakOf(b) - peakOf(a);
    if (sort === "code") return a.code.localeCompare(b.code);
    return a.district.localeCompare(b.district) || peakOf(b) - peakOf(a);
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="font-medium uppercase tracking-wide">Puls sieci</span>
          <span className="hidden items-center gap-3 sm:flex">
            {(["low", "mid", "high", "critical"] as const).map((t) => (
              <span key={t} className="inline-flex items-center gap-1">
                <span className={cn("size-2 rounded-sm", TONE_BG[t])} />
                {t === "low" ? "<50" : t === "mid" ? "50-79" : t === "high" ? "80-94" : "95+"}
              </span>
            ))}
          </span>
        </div>
        <div className="flex items-center gap-0.5 rounded-full bg-muted p-0.5">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                sort === s.key ? "bg-card text-foreground shadow-[var(--shadow-soft)]" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </header>

      <ul>
        {rows.map((s, i) => {
          const peak = peakOf(s);
          return (
            <li
              key={s.id}
              className="proto-rise group flex items-center gap-3 border-b border-border/60 px-4 py-2 last:border-0 hover:bg-surface-hover"
              style={{ animationDelay: `${Math.min(i, 12) * 18}ms` }}
            >
              <span className="w-[13.5rem] shrink-0 truncate">
                <span className="text-[11px] uppercase text-muted-foreground">{s.code}</span>
                <span className="ml-2 text-sm font-medium">{s.name}</span>
              </span>

              <span className="hidden w-24 shrink-0 truncate text-[11px] text-muted-foreground md:inline">
                {s.district}
              </span>

              {/* Pasmo: segment = pojemnik, wypełnienie w poziomie */}
              <span className="flex min-w-0 flex-1 gap-[3px]">
                {s.containers.map((c) => (
                  <span
                    key={c.id}
                    title={`${FRACTION_LABEL[c.fraction]}: ${c.fillLevel === null ? "brak pomiaru" : `${c.fillLevel}%`}`}
                    className="relative h-5 flex-1 overflow-hidden rounded-[4px] bg-muted"
                  >
                    {c.fillLevel === null ? (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                        N/D
                      </span>
                    ) : (
                      <span
                        className={cn("absolute inset-y-0 left-0 rounded-[4px]", TONE_BG[fillTone(c.fillLevel)])}
                        style={{ width: `${Math.max(4, c.fillLevel)}%` }}
                      />
                    )}
                    <span className="absolute inset-0 flex items-center pl-1 text-[9px] font-semibold uppercase tracking-wide text-foreground/45">
                      {FRACTION_LABEL[c.fraction].slice(0, 2)}
                    </span>
                  </span>
                ))}
              </span>

              <span className="flex w-24 shrink-0 items-center justify-end gap-2">
                {s.hasCamera && <Camera className="size-3.5 text-info" />}
                <span className="text-sm font-bold tabular-nums">
                  {peak < 0 ? <span className="text-xs font-medium text-muted-foreground">N/D</span> : `${peak}%`}
                </span>
              </span>

              <span className="hidden w-24 shrink-0 text-right text-[11px] text-muted-foreground lg:inline">
                {shortTime(s.lastSessionAt)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
