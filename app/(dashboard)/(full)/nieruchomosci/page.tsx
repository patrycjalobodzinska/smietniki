"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Search, Users, KeyRound } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import { Button, Input, Select, Badge, DataTable, type Column } from "@/components/ui";
import { StationStatusBadge } from "@/components/domain/badges";
import { PropertyDialog } from "@/components/domain/forms/property-dialog";
import { useProperties, useStations, useCooperatives } from "@/lib/api/hooks/use-infrastructure";
import type { Property } from "@/lib/types";

export default function PropertiesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [coop, setCoop] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [edited, setEdited] = useState<Property | null>(null);

  const { data, isLoading } = useProperties({ search, cooperativeId: coop || undefined });
  const { data: stations } = useStations();
  const { data: coops } = useCooperatives();

  const coopOptions = [
    { value: "", label: "Wszystkie spółdzielnie" },
    ...(coops ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];
  const stationName = (id: string | null) => (id ? stations?.find((s) => s.id === id)?.name ?? "—" : "—");
  const coopName = (id: string) => coops?.find((c) => c.id === id)?.name ?? "—";

  const columns: Column<Property>[] = [
    {
      key: "address",
      header: "Nieruchomość",
      cell: (p) => (
        <div>
          <p className="font-medium">{p.address}</p>
          <p className="text-xs text-muted-foreground">{coopName(p.cooperativeId)} · {p.district}</p>
        </div>
      ),
    },
    { key: "units", header: "Lokale", align: "right", cell: (p) => <span className="tabular-nums">{p.unitsCount}</span> },
    {
      key: "residents",
      header: "Mieszkańcy",
      align: "right",
      cell: (p) => <span className="inline-flex items-center gap-1 text-sm tabular-nums"><Users className="size-3.5 text-muted-foreground" />{p.residentsCount}</span>,
    },
    {
      key: "keys",
      header: "Aktywne klucze",
      align: "right",
      cell: (p) => (
        <span className="inline-flex items-center gap-1 text-sm tabular-nums">
          <KeyRound className="size-3.5 text-muted-foreground" />
          {p.activeKeys}
          {p.activeKeys > p.residentsCount && <Badge variant="warning">nadwyżka</Badge>}
        </span>
      ),
    },
    { key: "station", header: "Altanka", cell: (p) => <span className="text-sm text-muted-foreground">{stationName(p.assignedStationId)}</span> },
    { key: "status", header: "Status", cell: (p) => <StationStatusBadge status={p.status === "warning" ? "attention" : p.status === "active" ? "active" : "inactive"} /> },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (p) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            setEdited(p);
          }}
        >
          <Pencil /> Edytuj
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Nieruchomości i lokale"
        description="Relacja lokal → liczba mieszkańców → liczba aktywnych kluczy."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus /> Dodaj nieruchomość
          </Button>
        }
      />
      <FilterBar>
        <div className="min-w-56 flex-1">
          <Input icon={<Search />} placeholder="Szukaj adresu..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
        </div>
        <Select options={coopOptions} value={coop} onChange={(e) => setCoop(e.target.value)} className="h-9 w-56" />
      </FilterBar>
      <DataTable columns={columns} data={data} rowKey={(p) => p.id} loading={isLoading} onRowClick={(p) => router.push(`/nieruchomosci/${p.id}`)} emptyTitle="Brak nieruchomości" pageSize={15} />

      {addOpen && <PropertyDialog open onClose={() => setAddOpen(false)} />}
      {edited && <PropertyDialog open property={edited} onClose={() => setEdited(null)} />}
    </div>
  );
}
