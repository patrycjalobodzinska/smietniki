"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Camera, MapPin, KeyRound, Truck } from "lucide-react";
import { Spinner } from "@/components/ui";
import { VariantBadge, StationStatusBadge } from "@/components/domain/badges";
import { FillBar, FillDot } from "@/components/domain/fill-level";
import { FRACTION_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils/cn";
import { STATIONS, shortTime } from "../data";

/**
 * Wariant "Mapa" - oś: przestrzeń. Altanki to obiekty w terenie, więc mapa
 * jest widokiem głównym, a lista schodzi do roli szuflady z wyborem. Detal
 * wybranej altanki wjeżdża nad listę.
 */

const StationMap = dynamic(
  () => import("@/components/domain/station-map").then((m) => m.StationMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[560px] items-center justify-center rounded-2xl border border-border bg-muted/40">
        <Spinner />
      </div>
    ),
  },
);

export function MapSplitVariant() {
  const [selectedId, setSelectedId] = useState(STATIONS[0].id);
  const selected = STATIONS.find((s) => s.id === selectedId) ?? STATIONS[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <div className="overflow-hidden rounded-2xl border border-border">
        <StationMap stations={STATIONS} height={620} />
      </div>

      <aside className="flex min-h-0 flex-col gap-3">
        {/* Detal wybranej altanki - klucz w key wymusza ponowne wejście animacji */}
        <article key={selected.id} className="proto-rise rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">{selected.name}</h2>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{selected.address} · {selected.district}</span>
              </p>
            </div>
            <StationStatusBadge status={selected.status} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <VariantBadge variant={selected.deploymentVariant} />
            {selected.hasCamera && (
              <span className="inline-flex items-center gap-1 rounded-full bg-info/12 px-2 py-0.5 text-xs font-medium text-info">
                <Camera className="size-3" /> podgląd
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              <KeyRound className="size-3" /> {selected.openings24h} otwarć / 24 h
            </span>
          </div>

          <dl className="mt-4 space-y-2.5">
            {selected.containers.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <dt className="w-20 shrink-0 text-xs text-muted-foreground">{FRACTION_LABEL[c.fraction]}</dt>
                <dd className="min-w-0 flex-1"><FillBar level={c.fillLevel} /></dd>
              </div>
            ))}
          </dl>

          <footer className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Truck className="size-3.5" /> odbiór: {shortTime(selected.lastCollectionAt)}
            </span>
            <span>wejście: {shortTime(selected.lastSessionAt)}</span>
          </footer>
        </article>

        {/* Szuflada wyboru */}
        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-1.5">
          {STATIONS.map((s) => {
            const active = s.id === selected.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
                  active ? "bg-accent text-accent-foreground" : "hover:bg-surface-hover",
                )}
              >
                <FillDot level={s.avgFillLevel} className="shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{s.name}</span>
                  <span className="block text-[11px] uppercase text-muted-foreground">{s.code}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {s.avgFillLevel === null ? <span className="text-xs text-muted-foreground">N/D</span> : `${s.avgFillLevel}%`}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
