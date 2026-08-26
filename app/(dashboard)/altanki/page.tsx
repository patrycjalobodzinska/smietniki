"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Camera } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import { Button, Input, Select, DataTable, type Column } from "@/components/ui";
import { FillBar } from "@/components/domain/fill-level";
import { VariantBadge, StationStatusBadge } from "@/components/domain/badges";
import { useStations, useCooperatives } from "@/lib/api/hooks/use-infrastructure";
import type { BinStation, DeploymentVariant, StationStatus } from "@/lib/types";
import { VARIANT_LABEL } from "@/lib/labels";
import { formatRelative } from "@/lib/utils/format";

const VARIANT_OPTIONS = [
  { value: "all", label: "Wszystkie warianty" },
  ...(Object.keys(VARIANT_LABEL) as DeploymentVariant[]).map((v) => ({ value: v, label: VARIANT_LABEL[v] })),
];
const STATUS_OPTIONS = [
  { value: "all", label: "Wszystkie statusy" },
  { value: "active", label: "Aktywna" },
  { value: "attention", label: "Uwaga" },
  { value: "inactive", label: "Nieaktywna" },
];

export default function StationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [variant, setVariant] = useState<DeploymentVariant | "all">("all");
  const [status, setStatus] = useState<StationStatus | "all">("all");

  const { data, isLoading } = useStations({ search, variant, status });
  const { data: coops } = useCooperatives();
  const coopName = (id: string) => coops?.find((c) => c.id === id)?.name ?? "—";

  const columns: Column<BinStation>[] = [
    {
      key: "name",
      header: "Altanka",
      cell: (s) => (
        <div>
          <p className="font-medium">{s.name}</p>
          <p className="text-xs text-muted-foreground">{s.code} · {s.address}</p>
        </div>
      ),
    },
    { key: "coop", header: "Spółdzielnia", cell: (s) => <span className="text-sm">{coopName(s.cooperativeId)}</span> },
    { key: "variant", header: "Wariant", cell: (s) => <VariantBadge variant={s.deploymentVariant} /> },
    { key: "containers", header: "Pojemniki", align: "right", cell: (s) => <span className="tabular-nums">{s.containerCount}</span> },
    { key: "fill", header: "Śr. zapełnienie", className: "w-44", cell: (s) => <FillBar level={s.avgFillLevel} /> },
    {
      key: "camera",
      header: "Kamera",
      align: "center",
      cell: (s) => (s.hasCamera ? <Camera className="mx-auto size-4 text-info" /> : <span className="text-muted-foreground">—</span>),
    },
    { key: "collection", header: "Ostatni odbiór", cell: (s) => <span className="text-sm text-muted-foreground">{s.lastCollectionAt ? formatRelative(s.lastCollectionAt) : "—"}</span> },
    { key: "status", header: "Status", cell: (s) => <StationStatusBadge status={s.status} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Altanki"
        description="Altanki śmietnikowe z widocznym poziomem cyfryzacji (Access / Fill / Vision)."
        actions={<Button><Plus /> Dodaj altankę</Button>}
      />
      <FilterBar>
        <div className="min-w-56 flex-1">
          <Input icon={<Search />} placeholder="Szukaj nazwy, kodu lub adresu..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
        </div>
        <Select options={VARIANT_OPTIONS} value={variant} onChange={(e) => setVariant(e.target.value as DeploymentVariant | "all")} className="h-9 w-52" />
        <Select options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value as StationStatus | "all")} className="h-9 w-44" />
      </FilterBar>
      <DataTable columns={columns} data={data} rowKey={(s) => s.id} loading={isLoading} onRowClick={(s) => router.push(`/altanki/${s.id}`)} emptyTitle="Brak altanek" pageSize={15} />
    </div>
  );
}
