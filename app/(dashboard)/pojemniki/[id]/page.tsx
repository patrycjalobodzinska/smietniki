"use client";

import { useParams, useRouter } from "next/navigation";
import { Gauge, Clock, Truck, CalendarDays, TimerReset, Database, Info } from "lucide-react";
import { DetailHeader } from "@/components/layout/detail-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatCard,
  Badge,
  Spinner,
} from "@/components/ui";
import { TrendLineChart } from "@/components/charts";
import { FractionBadge, FillStatusBadge, DataSourceBadge } from "@/components/domain/badges";
import { useContainer, useContainerHistory, useStation } from "@/lib/api/hooks/use-infrastructure";
import { useCollections } from "@/lib/api/hooks/use-operations";
import { DATA_SOURCE_LABEL } from "@/lib/labels";
import { formatDateTime, formatRelative } from "@/lib/utils/format";

export default function ContainerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: container, isLoading } = useContainer(id);
  const { data: history } = useContainerHistory(id);
  const { data: station } = useStation(container?.stationId ?? "");
  const { data: collections } = useCollections({ stationId: container?.stationId });

  if (isLoading || !container) {
    return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  }

  const daysSinceCollection = container.lastCollectionAt
    ? Math.floor((Date.now() - +new Date(container.lastCollectionAt)) / 864e5)
    : null;

  return (
    <div>
      <DetailHeader
        breadcrumbs={[
          { label: "Pojemniki", href: "/pojemniki" },
          { label: container.code },
        ]}
        title={container.code}
        subtitle={station ? `${station.name} · ${station.address}` : undefined}
        badges={
          <>
            <FractionBadge fraction={container.fraction} />
            <FillStatusBadge status={container.fillStatus} />
            <DataSourceBadge source={container.dataSource} />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Zapełnienie" value={container.fillLevel === null ? "N/D" : `${container.fillLevel}%`} icon={Gauge} tone={(container.fillLevel ?? 0) >= 90 ? "danger" : (container.fillLevel ?? 0) >= 75 ? "warning" : "default"} />
        <StatCard label="Ostatni odczyt" value={container.lastMeasurementAt ? formatRelative(container.lastMeasurementAt) : "N/D"} icon={Clock} />
        <StatCard label="Ostatni odbiór" value={container.lastCollectionAt ? formatRelative(container.lastCollectionAt) : "—"} icon={Truck} />
        <StatCard label="Dni od odbioru" value={daysSinceCollection ?? "—"} icon={CalendarDays} />
        <StatCard label="Do przepełnienia" value={container.predictedFullAt ? formatRelative(container.predictedFullAt).replace("za ", "~") : "N/D"} icon={TimerReset} tone={container.predictedFullAt ? "warning" : "default"} />
        <StatCard label="Źródło danych" value={DATA_SOURCE_LABEL[container.dataSource]} icon={Database} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Trend napełnienia</CardTitle>
              <Badge variant="muted">7 dni</Badge>
            </CardHeader>
            <CardContent>
              {container.fillLevel === null ? (
                <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
                  Pojemnik bez pomiaru napełnienia (wariant Access).
                </div>
              ) : (
                history && <TrendLineChart data={history} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Historia odbiorów</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border">
              {(collections ?? []).slice(0, 6).map((c) => (
                <div key={c.id} className="flex cursor-pointer items-center gap-3 py-2.5 first:pt-0 hover:opacity-80" onClick={() => router.push(`/odbiory/${c.id}`)}>
                  <span className="min-w-0 flex-1 truncate text-sm">{c.operator}</span>
                  {c.levelBefore !== null && c.levelAfter !== null && <Badge variant="muted">{c.levelBefore}%→{c.levelAfter}%</Badge>}
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(c.collectedAt)}</span>
                </div>
              ))}
              {!collections?.length && <p className="py-4 text-sm text-muted-foreground">Brak odbiorów.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Predykcja przepełnienia</CardTitle></CardHeader>
            <CardContent>
              {container.predictedFullAt ? (
                <div className="space-y-2">
                  <p className="text-3xl font-semibold tracking-tight">{formatRelative(container.predictedFullAt).replace("za ", "~")}</p>
                  <p className="text-sm text-muted-foreground">do osiągnięcia 100% przy obecnym tempie.</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Brak wystarczających danych do predykcji.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Wiarygodność danych</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 rounded-lg bg-info/10 p-3 text-xs leading-relaxed text-muted-foreground">
                <Info className="size-4 shrink-0 text-info" />
                {container.dataSource === "auto"
                  ? "Dane pochodzą z czujnika napełnienia — wysoka wiarygodność."
                  : container.dataSource === "manual"
                    ? "Dane wprowadzane manualnie — średnia wiarygodność."
                    : container.dataSource === "estimated"
                      ? "Poziom estymowany na bazie trendu — ograniczona wiarygodność."
                      : "Brak telemetrii dla tego pojemnika (wariant Access)."}
                {!container.sensorOk && " Uwaga: status czujnika wskazuje awarię."}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
