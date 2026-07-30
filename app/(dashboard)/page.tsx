"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Warehouse, Trash2, Gauge, Activity, Radio, KeyRound, Camera } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent, StatCard, Spinner } from "@/components/ui";
import { DonutChart } from "@/components/charts";
import { useStations, useContainers } from "@/lib/api/hooks/use-infrastructure";
import { useDashboardSummary } from "@/lib/api/hooks/use-dashboard";
import { fillTone } from "@/lib/types";

const StationMap = dynamic(
  () => import("@/components/domain/station-map").then((m) => m.StationMap),
  { ssr: false, loading: () => <MapSkeleton /> },
);

function MapSkeleton() {
  return (
    <div className="flex h-[360px] items-center justify-center rounded-xl border border-border bg-muted/40">
      <Spinner />
    </div>
  );
}

/**
 * Operational dashboard — real data only (SprigaAPI). Every figure is derived
 * client-side from the live infrastructure endpoints; nothing here is mock. The
 * full feature set, including not-yet-wired modules, lives under /features.
 */
export default function DashboardPage() {
  const { data: stations, isLoading: stationsLoading } = useStations();
  const { data: containers, isLoading: containersLoading } = useContainers();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();

  const loading = stationsLoading || containersLoading;

  const ingestData = useMemo(() => {
    const i = summary?.ingest;
    return [
      { label: "Kamera", value: i?.cameraEvents ?? 0, color: "var(--color-chart-2)" },
      { label: "RFID", value: i?.rfidEvents ?? 0, color: "var(--color-chart-1)" },
      { label: "Termiczne", value: i?.thermalEvents ?? 0, color: "var(--color-chart-4)" },
      { label: "Nieznane", value: i?.unknownEvents ?? 0, color: "var(--color-chart-6)" },
    ].filter((d) => d.value > 0);
  }, [summary]);

  const kpis = useMemo(() => {
    const st = stations ?? [];
    const ct = containers ?? [];
    const measured = ct.filter((c) => typeof c.fillLevel === "number") as { fillLevel: number }[];
    const avgFill = measured.length
      ? Math.round(measured.reduce((s, c) => s + c.fillLevel, 0) / measured.length)
      : null;
    return {
      stations: st.length,
      activeStations: st.filter((s) => s.status === "active").length,
      containers: ct.length,
      withCamera: st.filter((s) => s.hasCamera).length,
      avgFill,
    };
  }, [stations, containers]);

  const distData = useMemo(() => {
    const measured = (containers ?? []).filter((c) => typeof c.fillLevel === "number");
    const bucket = (t: string) => measured.filter((c) => fillTone(c.fillLevel as number) === t).length;
    return [
      { label: "Przepełnione (95%+)", value: bucket("critical"), color: "var(--color-fill-critical)" },
      { label: "Wysokie (80–94%)", value: bucket("high"), color: "var(--color-fill-high)" },
      { label: "Średnie (50–79%)", value: bucket("mid"), color: "var(--color-fill-mid)" },
      { label: "Niskie (<50%)", value: bucket("low"), color: "var(--color-fill-low)" },
    ];
  }, [containers]);

  const variantData = useMemo(() => {
    const st = stations ?? [];
    const count = (v: string) => st.filter((s) => s.deploymentVariant === v).length;
    return [
      { label: "Access", value: count("access"), color: "var(--color-chart-6)" },
      { label: "Access + Fill", value: count("access_fill"), color: "var(--color-chart-1)" },
      { label: "Access + Fill + Vision", value: count("access_fill_vision"), color: "var(--color-chart-2)" },
    ];
  }, [stations]);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Bieżący stan infrastruktury odpadowej — dane na żywo z systemu." />

      {/* KPI — derived from live infrastructure endpoints */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Altanki" value={kpis.stations} icon={Warehouse} loading={loading} hint={`${kpis.activeStations} aktywnych`} />
        <StatCard label="Pojemniki" value={kpis.containers} icon={Trash2} loading={loading} />
        <StatCard label="Altanki z kamerą" value={kpis.withCamera} icon={Camera} loading={loading} />
        <StatCard label="Śr. zapełnienie" value={kpis.avgFill === null ? "N/D" : `${kpis.avgFill}%`} icon={Gauge} tone={(kpis.avgFill ?? 0) >= 80 ? "danger" : "default"} loading={loading} />
      </div>

      {/* Map + fill distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Mapa altanek</CardTitle>
            <span className="text-sm text-muted-foreground">{stations?.length ?? 0} lokalizacji</span>
          </CardHeader>
          <CardContent>
            <StationMap stations={stations ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dystrybucja zapełnienia</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={distData} />
            <div className="mt-2 grid grid-cols-1 gap-2">
              {distData.map((d) => (
                <div key={d.label} className="flex items-center gap-2 text-xs">
                  <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="ml-auto font-semibold tabular-nums">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment variants */}
      <Card>
        <CardHeader>
          <CardTitle>Warianty wdrożenia altanek</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid items-center gap-6 sm:grid-cols-[240px_1fr]">
            <DonutChart data={variantData} />
            <div className="space-y-1.5">
              {variantData.map((d) => (
                <div key={d.label} className="flex items-center gap-2 text-sm">
                  <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="ml-auto font-semibold tabular-nums">{d.value} altanek</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live platform summary — GET /v1/dashboard/summary */}
      <div className="flex items-center gap-2 pt-2">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-70" />
          <span className="relative inline-flex size-2 rounded-full bg-success" />
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Stan platformy — na żywo
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Śr. zapełnienie (platforma)" value={summary ? `${Math.round(summary.fill.averageFill)}%` : undefined} icon={Gauge} loading={summaryLoading} tone={(summary?.fill.averageFill ?? 0) >= 80 ? "danger" : "default"} />
        <StatCard label="Pomiary (24h)" value={summary?.fill.last24hMeasurements} icon={Activity} loading={summaryLoading} hint={summary ? `${summary.fill.totalMeasurements} łącznie` : undefined} />
        <StatCard label="Zdarzenia (24h)" value={summary?.ingest.last24hEvents} icon={Radio} loading={summaryLoading} hint={summary ? `${summary.ingest.totalEvents} łącznie` : undefined} />
        <StatCard label="Sesje dostępu (24h)" value={summary?.access.last24hSessions} icon={KeyRound} loading={summaryLoading} hint={summary ? `${summary.access.totalSessions} łącznie` : undefined} />
        <StatCard label="Retransmisje" value={summary?.ingest.totalRetransmissions} icon={Activity} loading={summaryLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Źródła zdarzeń (ingest)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid items-center gap-6 sm:grid-cols-[240px_1fr]">
            <DonutChart data={ingestData} />
            <div className="space-y-1.5">
              {ingestData.map((d) => (
                <div key={d.label} className="flex items-center gap-2 text-sm">
                  <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="ml-auto font-semibold tabular-nums">{d.value.toLocaleString("pl-PL")}</span>
                </div>
              ))}
              {summary && (
                <p className="pt-2 text-xs text-muted-foreground">
                  Pomiary automatyczne: {summary.fill.autoMeasurements.toLocaleString("pl-PL")} · ręczne: {summary.fill.manualMeasurements}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
