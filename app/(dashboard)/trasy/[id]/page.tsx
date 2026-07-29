"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";
import { MapPin, Clock, Gauge, Truck, AlertTriangle, Download, Send, Filter } from "lucide-react";
import { DetailHeader } from "@/components/layout/detail-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatCard,
  Button,
  Badge,
  Spinner,
} from "@/components/ui";
import { TrendLineChart } from "@/components/charts";
import { RouteStatusBadge } from "@/components/domain/badges";
import { useRoute, useVehicles } from "@/lib/api/hooks/use-operations";
import { useStations } from "@/lib/api/hooks/use-infrastructure";
import { formatDate } from "@/lib/utils/format";

const StationMap = dynamic(() => import("@/components/domain/station-map").then((m) => m.StationMap), {
  ssr: false,
  loading: () => <div className="flex h-80 items-center justify-center rounded-xl border border-border bg-muted/40"><Spinner /></div>,
});

export default function RouteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [criticalOnly, setCriticalOnly] = useState(false);

  const { data: route, isLoading } = useRoute(id);
  const { data: stations } = useStations();
  const { data: vehicles } = useVehicles();

  const stationById = useMemo(
    () => Object.fromEntries((stations ?? []).map((s) => [s.id, s])),
    [stations],
  );

  if (isLoading || !route) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  const stops = criticalOnly ? route.stops.filter((s) => s.critical) : route.stops;
  const routeStations = route.stops.map((s) => stationById[s.stationId]).filter(Boolean);
  const routePath = route.stops
    .map((s) => stationById[s.stationId])
    .filter(Boolean)
    .map((s) => [s.location.lat, s.location.lng] as LatLngExpression);

  const vehicle = vehicles?.find((v) => v.id === route.vehicleId);
  const criticalCount = route.stops.filter((s) => s.critical).length;

  // Cumulative estimated vehicle fill per stop (spec §15.5 chart).
  const fillCurve = route.stops.map((s, i) => ({
    label: `${i + 1}`,
    value: Math.min(100, Math.round((route.estimatedVehicleFill * (i + 1)) / route.stops.length)),
  }));

  return (
    <div>
      <DetailHeader
        breadcrumbs={[{ label: "Trasy PGK", href: "/trasy" }, { label: route.name }]}
        title={route.name}
        subtitle={`${formatDate(route.date)} · ${route.operator}`}
        badges={<RouteStatusBadge status={route.status} />}
        actions={
          <>
            <Button variant="outline"><Download /> Eksport</Button>
            <Button variant="outline"><Send /> Wyślij do operatora</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Punkty" value={route.stops.length} icon={MapPin} />
        <StatCard label="Punkty krytyczne" value={criticalCount} icon={AlertTriangle} tone={criticalCount ? "danger" : "default"} />
        <StatCard label="Przewidywany czas" value={`${route.estimatedDurationMin} min`} icon={Clock} />
        <StatCard label="Wykorzystanie pojazdu" value={`${route.estimatedVehicleFill}%`} icon={Gauge} tone={route.estimatedVehicleFill >= 85 ? "warning" : "default"} />
        <StatCard label="Dystans" value={`${route.distanceKm} km`} icon={MapPin} />
        <StatCard label="Pojazd" value={vehicle?.code ?? "—"} icon={Truck} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Mapa trasy</CardTitle>
              <Button variant={criticalOnly ? "primary" : "outline"} size="sm" onClick={() => setCriticalOnly((v) => !v)}>
                <Filter /> {criticalOnly ? "Wszystkie punkty" : "Tylko krytyczne"}
              </Button>
            </CardHeader>
            <CardContent>
              <StationMap
                stations={criticalOnly ? routeStations.filter((s) => route.stops.find((x) => x.stationId === s.id)?.critical) : routeStations}
                routePath={criticalOnly ? undefined : routePath}
                height={340}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Estymowane zapełnienie śmieciarki</CardTitle></CardHeader>
            <CardContent>
              <TrendLineChart data={fillCurve} />
              <p className="mt-1 text-xs text-muted-foreground">Oś X: kolejny punkt trasy · oś Y: szacowane wypełnienie pojazdu (%)</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Punkty w kolejności</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {stops.map((s) => (
              <div key={s.stationId} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
                  {s.order}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.stationName}</p>
                  <p className="text-xs text-muted-foreground">Est. zapełnienie {s.estimatedFillLevel}%</p>
                </div>
                {s.critical && <Badge variant="danger">krytyczny</Badge>}
              </div>
            ))}
            {!stops.length && <p className="py-4 text-sm text-muted-foreground">Brak punktów krytycznych.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
