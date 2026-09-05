"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Gauge, Camera, TrendingUp, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent, StatCard, Tabs, DataTable, type Column } from "@/components/ui";
import { HBarChart, DonutChart } from "@/components/charts";
import { FillBar } from "@/components/domain/fill-level";
import { ChangeFillButton } from "@/components/domain/change-fill-button";
import { useStations, useContainers } from "@/lib/api/hooks/use-infrastructure";
import { FRACTION_LABEL } from "@/lib/labels";
import type { WasteFraction } from "@/lib/types";

const TABS = [
  { value: "overview", label: "Przegląd" },
  { value: "overfill", label: "Bieżące przepełnienia" },
];

interface OverfillRow {
  id: string;
  code: string;
  stationName: string;
  fillLevel: number;
}

/** Analytics computed from live infrastructure data (KM1 scope: fill + coverage). */
export default function AnalyticsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const { data: stations, isLoading } = useStations();
  const { data: containers } = useContainers();

  const overview = useMemo(() => {
    const st = stations ?? [];
    const withFill = st.filter((s) => s.deploymentVariant !== "access").length;
    const withVision = st.filter((s) => s.deploymentVariant === "access_fill_vision").length;
    const measured = (containers ?? []).filter((c) => typeof c.fillLevel === "number");
    const avgFill = measured.length
      ? Math.round(measured.reduce((a, c) => a + (c.fillLevel as number), 0) / measured.length)
      : 0;
    return {
      fillCoverage: st.length ? Math.round((withFill / st.length) * 100) : 0,
      visionCoverage: st.length ? Math.round((withVision / st.length) * 100) : 0,
      avgFill,
      stationsOver80: st.filter((s) => (s.avgFillLevel ?? 0) >= 80).length,
    };
  }, [stations, containers]);

  const variantData = useMemo(() => {
    const st = stations ?? [];
    const c = (v: string) => st.filter((s) => s.deploymentVariant === v).length;
    return [
      { label: "Access", value: c("access"), color: "var(--color-chart-6)" },
      { label: "Access + Fill", value: c("access_fill"), color: "var(--color-chart-1)" },
      { label: "Access + Fill + Vision", value: c("access_fill_vision"), color: "var(--color-chart-3)" },
    ];
  }, [stations]);

  const fillByFraction = useMemo(() => {
    const byFraction = new Map<WasteFraction, number[]>();
    for (const c of containers ?? []) {
      if (typeof c.fillLevel !== "number") continue;
      const arr = byFraction.get(c.fraction) ?? [];
      arr.push(c.fillLevel);
      byFraction.set(c.fraction, arr);
    }
    return (["paper", "plastic", "glass", "bio", "mixed"] as WasteFraction[]).map((f) => {
      const arr = byFraction.get(f) ?? [];
      return { label: FRACTION_LABEL[f], value: arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0 };
    });
  }, [containers]);

  const overfill = useMemo(() => {
    const stationName = new Map((stations ?? []).map((s) => [s.id, s.name]));
    const rows: OverfillRow[] = (containers ?? [])
      .filter((c) => typeof c.fillLevel === "number" && (c.fillLevel as number) >= 80)
      .map((c) => ({ id: c.id, code: c.code, stationName: stationName.get(c.stationId) ?? "—", fillLevel: c.fillLevel as number }))
      .sort((a, b) => b.fillLevel - a.fillLevel);
    return {
      rows,
      over95: rows.filter((r) => r.fillLevel >= 95).length,
      over90: rows.filter((r) => r.fillLevel >= 90).length,
      over80: rows.length,
    };
  }, [stations, containers]);

  const overfillCols: Column<OverfillRow>[] = [
    { key: "code", header: "Pojemnik", cell: (r) => <span className="font-medium">{r.code}</span> },
    { key: "station", header: "Altanka", cell: (r) => <span className="text-sm text-muted-foreground">{r.stationName}</span> },
    { key: "fill", header: "Zapełnienie", className: "w-40", cell: (r) => <FillBar level={r.fillLevel} /> },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "w-16",
      cell: (r) => <ChangeFillButton containerCode={r.code} currentLevel={r.fillLevel} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Analityka" description="Wskaźniki zapełnienia i pokrycia technologicznego — na żywo z danych systemu." />
      <Tabs items={TABS} value={tab} onValueChange={setTab} />

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Pokrycie Fill" value={`${overview.fillCoverage}%`} icon={Gauge} tone="success" loading={isLoading} hint="altanek z czujnikami" />
            <StatCard label="Pokrycie Vision" value={`${overview.visionCoverage}%`} icon={Camera} tone="default" loading={isLoading} hint="altanek z monitoringiem" />
            <StatCard label="Śr. zapełnienie" value={`${overview.avgFill}%`} icon={TrendingUp} tone="warning" loading={isLoading} />
            <StatCard label="Altanki > 80%" value={overview.stationsOver80} icon={AlertTriangle} tone="danger" loading={isLoading} hint="wymagają uwagi" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Pokrycie technologiczne</CardTitle></CardHeader>
              <CardContent><DonutChart data={variantData} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Zapełnienie wg frakcji</CardTitle></CardHeader>
              <CardContent><HBarChart data={fillByFraction} /></CardContent>
            </Card>
          </div>
        </div>
      )}

      {tab === "overfill" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Przepełnione (95%+)" value={overfill.over95} icon={AlertTriangle} tone="danger" />
            <StatCard label="Wysokie (90%+)" value={overfill.over90} icon={AlertTriangle} tone="warning" />
            <StatCard label="Powyżej 80%" value={overfill.over80} icon={AlertTriangle} tone="default" />
          </div>
          <Card>
            <CardHeader><CardTitle>Pojemniki wymagające uwagi</CardTitle></CardHeader>
            <CardContent className="p-0">
              <DataTable columns={overfillCols} data={overfill.rows} rowKey={(r) => r.id} onRowClick={(r) => router.push(`/pojemniki/${r.id}`)} className="rounded-none border-0" emptyTitle="Brak pojemników powyżej 80%" />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
