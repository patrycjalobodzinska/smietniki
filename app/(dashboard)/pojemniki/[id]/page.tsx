"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Gauge, Clock, Database, Box, Activity, Recycle, Info, ArrowRight } from "lucide-react";
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
import { DATA_SOURCE_LABEL, FRACTION_LABEL } from "@/lib/labels";
import { formatRelative } from "@/lib/utils/format";

export default function ContainerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: container, isLoading } = useContainer(id);
  const { data: history } = useContainerHistory(id);
  const { data: station } = useStation(container?.stationId ?? "");

  if (isLoading || !container) {
    return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  }

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
        <StatCard label="Pojemność" value={`${container.capacityL} L`} icon={Box} />
        <StatCard label="Frakcja" value={FRACTION_LABEL[container.fraction]} icon={Recycle} />
        <StatCard label="Źródło danych" value={DATA_SOURCE_LABEL[container.dataSource]} icon={Database} />
        <StatCard label="Status czujnika" value={container.sensorOk ? "OK" : "Awaria"} icon={Activity} tone={container.sensorOk ? "success" : "danger"} />
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
        </div>

        <div className="space-y-6">
          {station && (
            <Card>
              <CardHeader><CardTitle>Altanka</CardTitle></CardHeader>
              <CardContent>
                <Link
                  href={`/altanki/${station.id}`}
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  {station.name}
                  <ArrowRight className="size-4" />
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">{station.address}, {station.district}</p>
              </CardContent>
            </Card>
          )}

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
