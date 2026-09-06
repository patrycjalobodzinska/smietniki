"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, KeyRound, Home, AlertTriangle, Plus, Minus, Pencil } from "lucide-react";
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
import {
  useProperty,
  useUnits,
  useIssueKey,
  useRevokeKey,
  useStation,
  useCooperative,
} from "@/lib/api/hooks/use-infrastructure";
import { PropertyDialog } from "@/components/domain/forms/property-dialog";
import { UnitDialog } from "@/components/domain/forms/unit-dialog";
import type { Unit } from "@/lib/types";
import { KEY_TYPE_LABEL, BUILDING_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/utils/format";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: property, isLoading } = useProperty(id);
  const { data: units } = useUnits(id);
  const { data: station } = useStation(property?.assignedStationId ?? "");
  const { data: coop } = useCooperative(property?.cooperativeId ?? "");
  const issueKey = useIssueKey(id);
  const revokeKey = useRevokeKey(id);
  const [editOpen, setEditOpen] = useState(false);
  const [addUnitOpen, setAddUnitOpen] = useState(false);

  if (isLoading || !property) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  const unitsWithoutKey = (units ?? []).filter((u) => u.activeKeys === 0).length;
  const unitsOverLimit = (units ?? []).filter((u) => u.activeKeys > u.keysLimit).length;

  const columns: Column<Unit>[] = [
    { key: "num", header: "Lokal", cell: (u) => <span className="font-medium">#{u.unitNumber}</span> },
    { key: "residents", header: "Mieszkańcy", align: "right", cell: (u) => <span className="tabular-nums">{u.residentsCount}</span> },
    { key: "limit", header: "Limit kluczy", align: "right", cell: (u) => <span className="tabular-nums">{u.keysLimit}</span> },
    {
      key: "keys",
      header: "Aktywne klucze",
      align: "right",
      cell: (u) => (
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          {u.activeKeys}
          {u.activeKeys > u.residentsCount && <Badge variant="warning">nadwyżka</Badge>}
        </span>
      ),
    },
    { key: "types", header: "Typy", cell: (u) => <span className="text-xs text-muted-foreground">{u.keyTypes.map((t) => KEY_TYPE_LABEL[t]).join(", ")}</span> },
    { key: "last", header: "Ostatnie użycie", cell: (u) => <span className="text-sm text-muted-foreground">{u.lastUsedAt ? formatDate(u.lastUsedAt) : "-"}</span> },
    {
      key: "actions",
      header: "Akcje",
      cell: (u) => (
        <div className="flex justify-end gap-1.5">
          <Button size="sm" variant="outline" onClick={() => issueKey.mutate(u.id)} disabled={issueKey.isPending}>
            <Plus /> Wydaj
          </Button>
          <Button size="sm" variant="ghost" onClick={() => revokeKey.mutate(u.id)} disabled={revokeKey.isPending || u.activeKeys === 0}>
            <Minus /> Dezaktywuj
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <DetailHeader
        breadcrumbs={[{ label: "Nieruchomości", href: "/nieruchomosci" }, { label: property.address }]}
        title={property.address}
        subtitle={`${coop?.name ?? ""} · ${property.district}`}
        actions={
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil /> Edytuj
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Lokale" value={property.unitsCount} icon={Home} />
        <StatCard label="Mieszkańcy" value={property.residentsCount} icon={Users} />
        <StatCard label="Aktywne klucze" value={property.activeKeys} icon={KeyRound} />
        <StatCard label="Lokale bez klucza" value={unitsWithoutKey} icon={KeyRound} tone={unitsWithoutKey ? "warning" : "default"} />
        <StatCard label="Nadwyżka kluczy" value={unitsOverLimit} icon={AlertTriangle} tone={unitsOverLimit ? "danger" : "default"} />
        <StatCard label="Altanka" value={station?.code ?? "-"} icon={Home} />
      </div>

      <div className="mt-3 sm:mt-6 grid gap-3 sm:gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-3 sm:space-y-6 lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Lokale</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setAddUnitOpen(true)}>
                <Plus /> Dodaj lokal
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable columns={columns} data={units} rowKey={(u) => u.id} className="rounded-none border-0" />
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-3 sm:space-y-6">
          <Card>
            <CardHeader><CardTitle>Dane podstawowe</CardTitle></CardHeader>
            <CardContent>
              <DescriptionList
                columns={1}
                items={[
                  { label: "Adres", value: property.address },
                  { label: "Spółdzielnia", value: coop?.name ?? "-" },
                  { label: "Typ budynku", value: BUILDING_LABEL[property.buildingType] },
                  { label: "Przypisana altanka", value: station ? <button className="text-primary hover:underline" onClick={() => router.push(`/altanki/${station.id}`)}>{station.name}</button> : "-" },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {editOpen && <PropertyDialog open property={property} onClose={() => setEditOpen(false)} />}
      {addUnitOpen && <UnitDialog open propertyId={id} onClose={() => setAddUnitOpen(false)} />}
    </div>
  );
}
