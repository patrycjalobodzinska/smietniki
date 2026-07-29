"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import { Button, Input, Select, DataTable, type Column } from "@/components/ui";
import { FillBar } from "@/components/domain/fill-level";
import { VariantBadge, StationStatusBadge } from "@/components/domain/badges";
import { useCooperatives } from "@/lib/api/hooks/use-infrastructure";
import type { Cooperative } from "@/lib/types";

const DISTRICT_OPTIONS = [
  { value: "", label: "Wszystkie dzielnice" },
  { value: "Śródmieście", label: "Śródmieście" },
  { value: "Nowe Miasto", label: "Nowe Miasto" },
  { value: "Baranówka", label: "Baranówka" },
  { value: "Zwięczyca", label: "Zwięczyca" },
];

const columns: Column<Cooperative>[] = [
  {
    key: "name",
    header: "Spółdzielnia",
    cell: (c) => (
      <div>
        <p className="font-medium">{c.name}</p>
        <p className="text-xs text-muted-foreground">{c.district} · {c.contactPerson}</p>
      </div>
    ),
  },
  { key: "properties", header: "Nieruch.", align: "right", cell: (c) => <span className="tabular-nums">{c.propertyCount}</span> },
  { key: "units", header: "Lokale", align: "right", cell: (c) => <span className="tabular-nums">{c.unitCount}</span> },
  { key: "stations", header: "Altanki", align: "right", cell: (c) => <span className="tabular-nums">{c.stationCount}</span> },
  { key: "keys", header: "Aktywne klucze", align: "right", cell: (c) => <span className="tabular-nums">{c.activeKeys}</span> },
  { key: "fill", header: "Śr. zapełnienie", className: "w-40", cell: (c) => <FillBar level={c.avgFillLevel} /> },
  { key: "variant", header: "Wariant dominujący", cell: (c) => <VariantBadge variant={c.deploymentMix} /> },
  { key: "status", header: "Status", cell: (c) => <StationStatusBadge status={c.status === "warning" ? "attention" : c.status === "active" ? "active" : "inactive"} /> },
];

export default function CooperativesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const { data, isLoading } = useCooperatives({ search, district: district || undefined });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Spółdzielnie / zarządcy"
        description="Podmioty odpowiedzialne za osiedlową infrastrukturę odpadową."
        actions={<Button><Plus /> Dodaj spółdzielnię</Button>}
      />
      <FilterBar>
        <div className="min-w-56 flex-1">
          <Input icon={<Search />} placeholder="Szukaj nazwy lub dzielnicy..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
        </div>
        <Select options={DISTRICT_OPTIONS} value={district} onChange={(e) => setDistrict(e.target.value)} className="h-9 w-52" />
      </FilterBar>
      <DataTable columns={columns} data={data} rowKey={(c) => c.id} loading={isLoading} onRowClick={(c) => router.push(`/spoldzielnie/${c.id}`)} emptyTitle="Brak spółdzielni" />
    </div>
  );
}
