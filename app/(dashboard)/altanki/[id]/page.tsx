"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Trash2,
  Gauge,
  Activity,
  AlertTriangle,
  Camera,
  KeyRound,
  MapPin,
  Info,
  Pencil,
  Plus,
} from "lucide-react";
import { DetailHeader } from "@/components/layout/detail-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatCard,
  DescriptionList,
  DataTable,
  Button,
  Badge,
  Spinner,
  type Column,
} from "@/components/ui";
import { TrendLineChart } from "@/components/charts";
import { FillBar } from "@/components/domain/fill-level";
import { ChangeFillButton } from "@/components/domain/change-fill-button";
import {
  VariantBadge,
  StationStatusBadge,
  DataSourceBadge,
  FractionBadge,
  FillStatusBadge,
  AnomalyBadge,
} from "@/components/domain/badges";
import { SnapshotGallery } from "@/components/domain/snapshot-gallery";
import { StationDialog } from "@/components/domain/forms/station-dialog";
import { ContainerDialog } from "@/components/domain/forms/container-dialog";
import { useStation, useContainers, useContainerHistory } from "@/lib/api/hooks/use-infrastructure";
import { useSessions } from "@/lib/api/hooks/use-operations";
import type { Container } from "@/lib/types";
import { VARIANT_LABEL, DATA_SOURCE_LABEL } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils/format";

const StationMap = dynamic(() => import("@/components/domain/station-map").then((m) => m.StationMap), {
  ssr: false,
  loading: () => <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-muted/40"><Spinner /></div>,
});

const ACCESS_MODE_LABEL: Record<string, string> = { rfid: "RFID", physical: "Klucz fizyczny", mobile: "Klucz mobilny", mixed: "Mieszany" };

export default function StationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: station, isLoading } = useStation(id);
  const { data: containers } = useContainers({ stationId: id });
  const { data: sessions } = useSessions({ stationId: id });
  const { data: history } = useContainerHistory(containers?.[0]?.id ?? "");
  const [editOpen, setEditOpen] = useState(false);
  const [addContainerOpen, setAddContainerOpen] = useState(false);

  if (isLoading || !station) {
    return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  }

  const sessions7d = (sessions ?? []).filter((s) => Date.now() - +new Date(s.startedAt) < 7 * 864e5).length;
  const anomalies7d = (sessions ?? []).filter((s) => s.anomaly && Date.now() - +new Date(s.startedAt) < 7 * 864e5).length;

  const containerCols: Column<Container>[] = [
    { key: "code", header: "Pojemnik", cell: (c) => <span className="font-medium">{c.code}</span> },
    { key: "fraction", header: "Frakcja", cell: (c) => <FractionBadge fraction={c.fraction} /> },
    { key: "fill", header: "Zapełnienie", className: "w-40", cell: (c) => <FillBar level={c.fillLevel} /> },
    { key: "status", header: "Status", cell: (c) => <FillStatusBadge status={c.fillStatus} /> },
    { key: "source", header: "Źródło", cell: (c) => <DataSourceBadge source={c.dataSource} /> },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "w-16",
      cell: (c) => <ChangeFillButton containerCode={c.code} currentLevel={c.fillLevel} />,
    },
  ];

  return (
    <div>
      <DetailHeader
        breadcrumbs={[{ label: "Altanki", href: "/altanki" }, { label: station.name }]}
        title={station.name}
        subtitle={`${station.code} · ${station.address}, ${station.district}`}
        badges={
          <>
            <VariantBadge variant={station.deploymentVariant} />
            <StationStatusBadge status={station.status} />
            {station.hasCamera && <Badge variant="info"><Camera className="size-3" /> Monitoring</Badge>}
            <DataSourceBadge source={station.fillDataSource} />
          </>
        }
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil /> Edytuj
            </Button>
            <Button variant="outline">
              <MapPin /> Pokaż na mapie
            </Button>
          </>
        }
      />

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Pojemniki" value={station.containerCount} icon={Trash2} />
        <StatCard label="Śr. zapełnienie" value={station.avgFillLevel === null ? "N/D" : `${station.avgFillLevel}%`} icon={Gauge} tone={(station.avgFillLevel ?? 0) >= 80 ? "danger" : "default"} />
        <StatCard label="Sesje (7 dni)" value={sessions7d} icon={Activity} />
        <StatCard label="Anomalie (7 dni)" value={anomalies7d} icon={AlertTriangle} tone={anomalies7d ? "danger" : "default"} />
        <StatCard label="Sposób dostępu" value={ACCESS_MODE_LABEL[station.accessMode]} icon={KeyRound} />
        <StatCard label="Kamera" value={station.hasCamera ? "Tak" : "Nie"} icon={Camera} tone={station.hasCamera ? "success" : "default"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left / main */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Pojemniki</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setAddContainerOpen(true)}>
                <Plus /> Dodaj pojemnik
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                columns={containerCols}
                data={containers}
                rowKey={(c) => c.id}
                onRowClick={(c) => router.push(`/pojemniki/${c.id}`)}
                className="rounded-none border-0"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Trend zapełnienia (7 dni)</CardTitle></CardHeader>
            <CardContent>{history && <TrendLineChart data={history} />}</CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Historia sesji dostępu</CardTitle>
              <span className="text-xs text-muted-foreground">{sessions?.length ?? 0} sesji</span>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {(sessions ?? []).slice(0, 5).map((s) => (
                <button
                  key={s.id}
                  onClick={() => router.push(`/sesje/${s.id}`)}
                  className="flex w-full items-center gap-3 py-2.5 text-left transition-colors first:pt-0 hover:bg-lime/8"
                >
                  <KeyRound className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{s.keyIdentifier}</p>
                  </div>
                  {s.anomaly && <AnomalyBadge />}
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(s.startedAt)}</span>
                </button>
              ))}
              {!sessions?.length && <p className="py-4 text-sm text-muted-foreground">Brak sesji.</p>}
              {(sessions?.length ?? 0) > 5 && (
                <div className="pt-3">
                  <button
                    onClick={() => router.push(`/sesje?station=${id}`)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Zobacz wszystkie ({sessions!.length}) →
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right / side */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Pozycja</CardTitle></CardHeader>
            <CardContent><StationMap stations={[station]} height={220} /></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Konfiguracja technologiczna</CardTitle></CardHeader>
            <CardContent>
              <DescriptionList
                columns={1}
                items={[
                  { label: "Wariant wdrożenia", value: VARIANT_LABEL[station.deploymentVariant] },
                  { label: "Sposób otwierania", value: ACCESS_MODE_LABEL[station.accessMode] },
                  { label: "Źródło danych o napełnieniu", value: DATA_SOURCE_LABEL[station.fillDataSource] },
                  { label: "Monitoring wideo", value: station.hasCamera ? "Tak" : "Nie" },
                  { label: "Współrzędne", value: `${station.location.lat.toFixed(4)}, ${station.location.lng.toFixed(4)}` },
                ]}
              />
            </CardContent>
          </Card>

          {station.hasCamera && (
            <Card>
              <CardHeader><CardTitle>Snapshoty (Vision)</CardTitle></CardHeader>
              <CardContent>
                {/* Real JPEGs from the ingest snapshots endpoint. */}
                <SnapshotGallery stationCode={station.code} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Kontrola dostępu</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 rounded-lg bg-info/10 p-3 text-xs leading-relaxed text-muted-foreground">
                <Info className="size-4 shrink-0 text-info" />
                Otwarcie altanki wymaga autoryzacji kluczem ({ACCESS_MODE_LABEL[station.accessMode]}). Nieudane próby są rejestrowane, a przekroczenie limitu podnosi flagę anomalii sesji.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {editOpen && <StationDialog open station={station} onClose={() => setEditOpen(false)} />}
      {addContainerOpen && (
        <ContainerDialog open stationId={station.id} onClose={() => setAddContainerOpen(false)} />
      )}
    </div>
  );
}
