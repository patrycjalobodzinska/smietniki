"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Warehouse, Gauge, Activity, Radio, KeyRound, Camera, Maximize2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button, Card, CardHeader, CardTitle, CardContent, Dialog, StatCard, Spinner } from "@/components/ui";
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
    <div className="flex h-[420px] items-center justify-center rounded-xl border border-border bg-muted/40">
      <Spinner />
    </div>
  );
}

/**
 * Operational dashboard - real data only (SprigaAPI). Every figure is derived
 * client-side from the live infrastructure endpoints; nothing here is mock.
 */
export default function DashboardPage() {
  const { data: stations, isLoading: stationsLoading } = useStations();
  const { data: containers, isLoading: containersLoading } = useContainers();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();

  const loading = stationsLoading || containersLoading;
  const [mapOpen, setMapOpen] = useState(false);

  // Liczby altanek/pojemników pochodzą z list infrastruktury; średnie
  // zapełnienie i telemetrię podaje /v1/dashboard/summary - nie liczymy ich
  // drugi raz na froncie.
  const kpis = useMemo(() => {
    const st = stations ?? [];
    return {
      stations: st.length,
      activeStations: st.filter((s) => s.status === "active").length,
      withCamera: st.filter((s) => s.hasCamera).length,
    };
  }, [stations]);

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

  return (
    <div className="min-w-0 space-y-3 sm:space-y-6">
      <PageHeader title="Dashboard" />

      {/* Jedna sekcja KPI: infrastruktura z list + telemetria z /v1/dashboard/summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 [&>*]:flex [&>*]:min-h-[7.5rem] [&>*]:flex-col [&>*]:justify-center">
        <StatCard
          label="Śr. zapełnienie"
          value={summary ? `${Math.round(summary.fill.averageFill)}%` : undefined}
          icon={Gauge}
          loading={summaryLoading}
          dark
          hint={summary ? `${summary.fill.last24hMeasurements} pomiarów w 24 h` : undefined}
        />
        <StatCard label="Altanki" value={kpis.stations} icon={Warehouse} loading={loading} hint={`${kpis.activeStations} aktywnych, ${kpis.withCamera} z kamerą`} />
        <StatCard
          label="Otwarcia altanek (24 h)"
          value={summary?.access.last24hSessions}
          icon={KeyRound}
          loading={summaryLoading}
          hint={summary ? `${summary.access.totalSessions.toLocaleString("pl-PL")} łącznie` : undefined}
        />
        <StatCard
          label="Pomiary zapełnienia (24 h)"
          value={summary?.fill.last24hMeasurements}
          icon={Activity}
          loading={summaryLoading}
          hint={summary ? `${summary.fill.totalMeasurements.toLocaleString("pl-PL")} łącznie` : undefined}
        />
        <StatCard
          label="Zdarzenia (24 h)"
          value={summary?.ingest.last24hEvents}
          icon={Radio}
          loading={summaryLoading}
          hint={summary ? `${summary.ingest.totalEvents.toLocaleString("pl-PL")} łącznie` : undefined}
        />
        <StatCard
          label="Retransmisje"
          value={summary?.ingest.totalRetransmissions}
          icon={Activity}
          loading={summaryLoading}
          hint="powtórzone wysyłki zdarzeń"
        />
        <StatCard
          label="Urządzenia online"
          value={summary ? `${summary.devices.online}/${summary.devices.total}` : undefined}
          icon={Camera}
          loading={summaryLoading}
          tone={summary && summary.devices.offline > 0 ? "warning" : "default"}
          hint={summary ? `${summary.devices.offline} offline` : undefined}
        />
      </div>

      {/* Map + fill distribution */}
      <div className="grid gap-3 sm:gap-6 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle>Mapa altanek</CardTitle>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {stations?.length ?? 0} lokalizacji
              </span>
              <Button size="sm" variant="ghost" onClick={() => setMapOpen(true)}>
                <Maximize2 /> Powiększ
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <StationMap stations={stations ?? []} height={420} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zapełnienie</CardTitle>
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

      {mapOpen && (
        <Dialog
          open
          onClose={() => setMapOpen(false)}
          title="Mapa altanek"
          description={`${stations?.length ?? 0} lokalizacji`}
          className="max-w-6xl"
        >
          <StationMap stations={stations ?? []} height="72dvh" />
        </Dialog>
      )}
    </div>
  );
}
