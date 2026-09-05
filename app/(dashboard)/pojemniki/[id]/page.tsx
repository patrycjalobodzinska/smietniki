"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Gauge,
  Clock,
  Database,
  Box,
  Activity,
  Recycle,
  Info,
  ArrowRight,
  Pencil,
} from "lucide-react";
import { DetailHeader } from "@/components/layout/detail-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatCard,
  Badge,
  Button,
  DataTable,
  Spinner,
  type Column,
} from "@/components/ui";
import { TrendLineChart } from "@/components/charts";
import { FractionBadge, FillStatusBadge, DataSourceBadge } from "@/components/domain/badges";
import { FillBar } from "@/components/domain/fill-level";
import { ContainerDialog } from "@/components/domain/forms/container-dialog";
import { MeasurementDialog } from "@/components/domain/forms/measurement-dialog";
import { useContainer, useContainerHistory, useStation } from "@/lib/api/hooks/use-infrastructure";
import { useFillMeasurements } from "@/lib/api/hooks/use-fill";
import type { FillMeasurement } from "@/lib/types";
import { DATA_SOURCE_LABEL, FRACTION_LABEL } from "@/lib/labels";
import { formatDateTime, formatRelative } from "@/lib/utils/format";

export default function ContainerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: container, isLoading } = useContainer(id);
  const { data: history } = useContainerHistory(id);
  const { data: station } = useStation(container?.stationId ?? "");
  const { data: measurements, isLoading: measurementsLoading } = useFillMeasurements(
    { containerCode: container?.code, limit: 50 },
    !!container?.code,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [measureOpen, setMeasureOpen] = useState(false);

  if (isLoading || !container) {
    return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  }

  const measurementCols: Column<FillMeasurement>[] = [
    { key: "value", header: "Zapełnienie", className: "w-40", cell: (m) => <FillBar level={m.value} /> },
    { key: "source", header: "Źródło", cell: (m) => <DataSourceBadge source={m.source} /> },
    {
      key: "device",
      header: "Urządzenie",
      cell: (m) => <span className="text-sm text-muted-foreground">{m.deviceKey ?? "wpis ręczny"}</span>,
    },
    {
      key: "measured",
      header: "Czas pomiaru",
      align: "right",
      cell: (m) => <span className="text-sm text-muted-foreground">{formatDateTime(m.measuredAt)}</span>,
    },
  ];

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
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil /> Edytuj
            </Button>
            <Button onClick={() => setMeasureOpen(true)}>
              <Gauge /> Zmień zapełnienie
            </Button>
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

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Historia pomiarów</CardTitle>
              <span className="text-xs text-muted-foreground">
                {measurements?.length ?? 0} odczytów
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                columns={measurementCols}
                data={measurements}
                rowKey={(m) => m.id}
                loading={measurementsLoading}
                className="rounded-none border-0"
                emptyTitle="Brak pomiarów"
                emptyDescription="Ten pojemnik nie ma jeszcze odczytów zapełnienia."
                pageSize={10}
              />
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

      {editOpen && <ContainerDialog open container={container} onClose={() => setEditOpen(false)} />}
      {measureOpen && (
        <MeasurementDialog
          open
          containerCode={container.code}
          currentLevel={container.fillLevel}
          onClose={() => setMeasureOpen(false)}
        />
      )}
    </div>
  );
}
