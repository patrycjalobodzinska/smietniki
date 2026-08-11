"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Clock, Gauge } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, DataTable, type Column } from "@/components/ui";
import { RouteStatusBadge } from "@/components/domain/badges";
import { useRoutes } from "@/lib/api/hooks/use-operations";
import type { CollectionRoute, RouteStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils/format";

const TABS = [
  { value: "all", label: "Wszystkie" },
  { value: "planned", label: "Zaplanowane" },
  { value: "in_progress", label: "W toku" },
  { value: "completed", label: "Zakończone" },
];

const columns: Column<CollectionRoute>[] = [
  {
    key: "name",
    header: "Trasa",
    cell: (r) => (
      <div>
        <p className="font-medium">{r.name}</p>
        <p className="text-xs text-muted-foreground">{formatDate(r.date)} · {r.operator}</p>
      </div>
    ),
  },
  {
    key: "stops",
    header: "Punkty",
    align: "right",
    cell: (r) => <span className="inline-flex items-center gap-1 text-sm tabular-nums"><MapPin className="size-3.5 text-muted-foreground" />{r.stops.length}</span>,
  },
  {
    key: "duration",
    header: "Czas",
    align: "right",
    cell: (r) => <span className="inline-flex items-center gap-1 text-sm tabular-nums"><Clock className="size-3.5 text-muted-foreground" />{r.estimatedDurationMin} min</span>,
  },
  {
    key: "fill",
    header: "Wykorzystanie pojazdu",
    align: "right",
    cell: (r) => <span className="inline-flex items-center gap-1 text-sm tabular-nums"><Gauge className="size-3.5 text-muted-foreground" />{r.estimatedVehicleFill}%</span>,
  },
  { key: "distance", header: "Dystans", align: "right", cell: (r) => <span className="text-sm tabular-nums">{r.distanceKm} km</span> },
  { key: "status", header: "Status", cell: (r) => <RouteStatusBadge status={r.status} /> },
];

export default function RoutesPage() {
  const router = useRouter();
  const [status, setStatus] = useState<RouteStatus | "all">("all");
  const { data, isLoading } = useRoutes({ status });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Trasy PGK"
        description="Planowanie i optymalizacja tras odbioru odpadów."
      />
      <Tabs items={TABS} value={status} onValueChange={(v) => setStatus(v as RouteStatus | "all")} />
      <DataTable columns={columns} data={data} rowKey={(r) => r.id} loading={isLoading} onRowClick={(r) => router.push(`/trasy/${r.id}`)} emptyTitle="Brak tras" />
    </div>
  );
}
