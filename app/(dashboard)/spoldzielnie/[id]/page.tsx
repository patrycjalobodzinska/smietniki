"use client";

import { useParams, useRouter } from "next/navigation";
import { Warehouse, Home, KeyRound, Trash2, Gauge, Users } from "lucide-react";
import { DetailHeader } from "@/components/layout/detail-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatCard,
  DescriptionList,
  DataTable,
  Spinner,
  type Column,
} from "@/components/ui";
import { DonutChart } from "@/components/charts";
import { FillBar } from "@/components/domain/fill-level";
import { VariantBadge, StationStatusBadge } from "@/components/domain/badges";
import { useCooperative, useProperties, useStations } from "@/lib/api/hooks/use-infrastructure";
import type { BinStation, Property } from "@/lib/types";

export default function CooperativeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: coop, isLoading } = useCooperative(id);
  const { data: properties } = useProperties({ cooperativeId: id });
  const { data: stations } = useStations({ cooperativeId: id });

  if (isLoading || !coop) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  const coverage = [
    { label: "Access", value: (stations ?? []).filter((s) => s.deploymentVariant === "access").length, color: "var(--color-chart-6)" },
    { label: "Fill", value: (stations ?? []).filter((s) => s.deploymentVariant === "access_fill").length, color: "var(--color-chart-1)" },
    { label: "Vision", value: (stations ?? []).filter((s) => s.deploymentVariant === "access_fill_vision").length, color: "var(--color-chart-2)" },
  ];

  const propCols: Column<Property>[] = [
    { key: "address", header: "Adres", cell: (p) => <span className="font-medium">{p.address}</span> },
    { key: "units", header: "Lokale", align: "right", cell: (p) => <span className="tabular-nums">{p.unitsCount}</span> },
    { key: "residents", header: "Mieszkańcy", align: "right", cell: (p) => <span className="tabular-nums">{p.residentsCount}</span> },
    { key: "keys", header: "Klucze", align: "right", cell: (p) => <span className="tabular-nums">{p.activeKeys}</span> },
  ];
  const stationCols: Column<BinStation>[] = [
    { key: "name", header: "Altanka", cell: (s) => <span className="font-medium">{s.name}</span> },
    { key: "variant", header: "Wariant", cell: (s) => <VariantBadge variant={s.deploymentVariant} /> },
    { key: "fill", header: "Zapełnienie", className: "w-40", cell: (s) => <FillBar level={s.avgFillLevel} /> },
    { key: "status", header: "Status", cell: (s) => <StationStatusBadge status={s.status} /> },
  ];

  return (
    <div>
      <DetailHeader
        breadcrumbs={[{ label: "Spółdzielnie", href: "/spoldzielnie" }, { label: coop.name }]}
        title={coop.name}
        subtitle={`${coop.district} · ${coop.address}`}
        badges={<VariantBadge variant={coop.deploymentMix} />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Altanki" value={coop.stationCount} icon={Warehouse} />
        <StatCard label="Nieruchomości" value={coop.propertyCount} icon={Home} />
        <StatCard label="Lokale" value={coop.unitCount} icon={Users} />
        <StatCard label="Aktywne klucze" value={coop.activeKeys} icon={KeyRound} />
        <StatCard label="Śr. zapełnienie" value={coop.avgFillLevel === null ? "N/D" : `${coop.avgFillLevel}%`} icon={Gauge} tone={(coop.avgFillLevel ?? 0) >= 80 ? "danger" : "default"} />
        <StatCard label="Pojemniki" value={(stations ?? []).reduce((a, s) => a + s.containerCount, 0)} icon={Trash2} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Nieruchomości</CardTitle></CardHeader>
            <CardContent className="p-0">
              <DataTable columns={propCols} data={properties} rowKey={(p) => p.id} onRowClick={(p) => router.push(`/nieruchomosci/${p.id}`)} className="rounded-none border-0" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Altanki</CardTitle></CardHeader>
            <CardContent className="p-0">
              <DataTable columns={stationCols} data={stations} rowKey={(s) => s.id} onRowClick={(s) => router.push(`/altanki/${s.id}`)} className="rounded-none border-0" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Dane podstawowe</CardTitle></CardHeader>
            <CardContent>
              <DescriptionList
                columns={1}
                items={[
                  { label: "Osoba kontaktowa", value: coop.contactPerson },
                  { label: "Email", value: coop.email },
                  { label: "Telefon", value: coop.phone },
                  { label: "Dzielnica", value: coop.district },
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Pokrycie technologiczne</CardTitle></CardHeader>
            <CardContent><DonutChart data={coverage} /></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
