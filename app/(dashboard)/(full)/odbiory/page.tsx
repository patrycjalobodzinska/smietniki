"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import { Button, Input, Select, Badge, DataTable, type Column } from "@/components/ui";
import { FractionBadge, CollectionStatusBadge } from "@/components/domain/badges";
import { useCollections } from "@/lib/api/hooks/use-operations";
import type { Collection, WasteFraction, CollectionStatus } from "@/lib/types";
import { FRACTION_LABEL } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils/format";

const FRACTION_OPTIONS = [{ value: "all", label: "Wszystkie frakcje" }, ...(Object.keys(FRACTION_LABEL) as WasteFraction[]).map((f) => ({ value: f, label: FRACTION_LABEL[f] }))];
const STATUS_OPTIONS = [
  { value: "all", label: "Wszystkie statusy" },
  { value: "confirmed", label: "Potwierdzony" },
  { value: "estimated", label: "Estymowany" },
];

export default function CollectionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [fraction, setFraction] = useState<WasteFraction | "all">("all");
  const [status, setStatus] = useState<CollectionStatus | "all">("all");

  const { data, isLoading } = useCollections({ search, fraction, status });

  const columns: Column<Collection>[] = [
    { key: "station", header: "Altanka", cell: (c) => <span className="font-medium">{c.stationName}</span> },
    { key: "fraction", header: "Frakcja", cell: (c) => <FractionBadge fraction={c.fraction} /> },
    { key: "operator", header: "Operator", cell: (c) => <span className="text-sm">{c.operator}</span> },
    {
      key: "level",
      header: "Poziom przed → po",
      cell: (c) =>
        c.levelBefore !== null && c.levelAfter !== null ? (
          <Badge variant="muted">{c.levelBefore}% → {c.levelAfter}%</Badge>
        ) : (
          <span className="text-sm text-muted-foreground">N/D</span>
        ),
    },
    { key: "date", header: "Data", cell: (c) => <span className="text-sm text-muted-foreground">{formatDateTime(c.collectedAt)}</span> },
    { key: "status", header: "Status", cell: (c) => <CollectionStatusBadge status={c.status} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Odbiory"
        description="Historia i bieżące operacje odbioru odpadów."
        actions={<Button variant="outline"><Download /> Eksport CSV</Button>}
      />
      <FilterBar>
        <div className="min-w-48 flex-1">
          <Input icon={<Search />} placeholder="Szukaj altanki..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
        </div>
        <Select options={FRACTION_OPTIONS} value={fraction} onChange={(e) => setFraction(e.target.value as WasteFraction | "all")} className="h-9 w-44" />
        <Select options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value as CollectionStatus | "all")} className="h-9 w-44" />
      </FilterBar>
      <DataTable columns={columns} data={data} rowKey={(c) => c.id} loading={isLoading} onRowClick={(c) => router.push(`/odbiory/${c.id}`)} emptyTitle="Brak odbiorów" pageSize={15} />
    </div>
  );
}
