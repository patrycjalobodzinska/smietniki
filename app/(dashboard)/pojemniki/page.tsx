"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import { Button, Input, Select, DataTable, type Column } from "@/components/ui";
import { FillBar } from "@/components/domain/fill-level";
import { FractionBadge, FillStatusBadge, DataSourceBadge } from "@/components/domain/badges";
import { ContainerDialog } from "@/components/domain/forms/container-dialog";
import { ChangeFillButton } from "@/components/domain/change-fill-button";
import { useContainers, useStations } from "@/lib/api/hooks/use-infrastructure";
import type { Container, WasteFraction, FillStatus, DataSource } from "@/lib/types";
import { FRACTION_LABEL, FILL_STATUS_LABEL, DATA_SOURCE_LABEL } from "@/lib/labels";
import { formatRelative } from "@/lib/utils/format";

const FRACTION_OPTIONS = [{ value: "all", label: "Wszystkie frakcje" }, ...(Object.keys(FRACTION_LABEL) as WasteFraction[]).map((f) => ({ value: f, label: FRACTION_LABEL[f] }))];
const STATUS_OPTIONS = [{ value: "all", label: "Wszystkie statusy" }, ...(Object.keys(FILL_STATUS_LABEL) as FillStatus[]).map((s) => ({ value: s, label: FILL_STATUS_LABEL[s] }))];
const SOURCE_OPTIONS = [{ value: "all", label: "Każde źródło" }, ...(Object.keys(DATA_SOURCE_LABEL) as DataSource[]).map((s) => ({ value: s, label: DATA_SOURCE_LABEL[s] }))];

export default function ContainersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [fraction, setFraction] = useState<WasteFraction | "all">("all");
  const [status, setStatus] = useState<FillStatus | "all">("all");
  const [dataSource, setDataSource] = useState<DataSource | "all">("all");
  const [addOpen, setAddOpen] = useState(false);

  const { data, isLoading } = useContainers({ search, fraction, status, dataSource });
  const { data: stations } = useStations();
  const stationName = (id: string) => stations?.find((s) => s.id === id)?.name ?? "—";

  const columns: Column<Container>[] = [
    { key: "code", header: "Pojemnik", cell: (c) => <span className="font-medium">{c.code}</span> },
    { key: "station", header: "Altanka", cell: (c) => <span className="text-sm text-muted-foreground">{stationName(c.stationId)}</span> },
    { key: "fraction", header: "Frakcja", cell: (c) => <FractionBadge fraction={c.fraction} /> },
    { key: "capacity", header: "Pojemność", align: "right", cell: (c) => <span className="text-sm tabular-nums">{c.capacityL} l</span> },
    { key: "fill", header: "Zapełnienie", className: "w-44", cell: (c) => <FillBar level={c.fillLevel} /> },
    { key: "status", header: "Status", cell: (c) => <FillStatusBadge status={c.fillStatus} /> },
    { key: "source", header: "Źródło danych", cell: (c) => <DataSourceBadge source={c.dataSource} /> },
    { key: "predicted", header: "Przepełnienie", cell: (c) => <span className="text-sm text-muted-foreground">{c.predictedFullAt ? `za ${formatRelative(c.predictedFullAt).replace("za ", "")}` : "N/D"}</span> },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "w-16",
      cell: (c) => <ChangeFillButton containerCode={c.code} currentLevel={c.fillLevel} />,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pojemniki"
        description="Pojemniki osiedlowe ze statusem zapełnienia i źródłem danych."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Dodaj pojemnik
          </Button>
        }
      />
      <FilterBar>
        <div className="min-w-48 flex-1">
          <Input icon={<Search />} placeholder="Szukaj po kodzie..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
        </div>
        <Select options={FRACTION_OPTIONS} value={fraction} onChange={(e) => setFraction(e.target.value as WasteFraction | "all")} className="h-9 w-44" />
        <Select options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value as FillStatus | "all")} className="h-9 w-44" />
        <Select options={SOURCE_OPTIONS} value={dataSource} onChange={(e) => setDataSource(e.target.value as DataSource | "all")} className="h-9 w-44" />
      </FilterBar>
      <DataTable columns={columns} data={data} rowKey={(c) => c.id} loading={isLoading} onRowClick={(c) => router.push(`/pojemniki/${c.id}`)} emptyTitle="Brak pojemników" pageSize={15} />

      {addOpen && <ContainerDialog open onClose={() => setAddOpen(false)} />}
    </div>
  );
}
