"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import { Button, Input, Select, DataTable, EmptyState, ViewToggle, type Column, type ListView } from "@/components/ui";
import { FillBar } from "@/components/domain/fill-level";
import { FractionBadge, FillStatusBadge, DataSourceBadge } from "@/components/domain/badges";
import { ContainerDialog } from "@/components/domain/forms/container-dialog";
import { ChangeFillButton } from "@/components/domain/change-fill-button";
import { ContainerCard, ContainerCardSkeleton, sortByFill } from "@/components/domain/container-card";
import { useContainers, useStations } from "@/lib/api/hooks/use-infrastructure";
import type { Container, WasteFraction, FillStatus, DataSource } from "@/lib/types";
import { FRACTION_LABEL, FILL_STATUS_LABEL, DATA_SOURCE_LABEL } from "@/lib/labels";
import { formatRelative } from "@/lib/utils/format";
import { useDebounced } from "@/lib/utils/use-debounced";
import { useLocalStorage } from "@/lib/utils/use-local-storage";
import { cn } from "@/lib/utils/cn";

const FRACTION_OPTIONS = [{ value: "all", label: "Wszystkie frakcje" }, ...(Object.keys(FRACTION_LABEL) as WasteFraction[]).map((f) => ({ value: f, label: FRACTION_LABEL[f] }))];
const STATUS_OPTIONS = [{ value: "all", label: "Wszystkie statusy" }, ...(Object.keys(FILL_STATUS_LABEL) as FillStatus[]).map((s) => ({ value: s, label: FILL_STATUS_LABEL[s] }))];
const SOURCE_OPTIONS = [{ value: "all", label: "Każde źródło" }, ...(Object.keys(DATA_SOURCE_LABEL) as DataSource[]).map((s) => ({ value: s, label: DATA_SOURCE_LABEL[s] }))];

const VIEW_KEY = "pojemniki:view";
const isListView = (v: string): v is ListView => v === "table" || v === "cards";

export default function ContainersPage() {
  const router = useRouter();
  // Kafle domyślnie - tak samo jak na liście altanek.
  const [view, setView] = useLocalStorage<ListView>(VIEW_KEY, "cards", isListView);
  const [search, setSearch] = useState("");
  const [fraction, setFraction] = useState<WasteFraction | "all">("all");
  const [status, setStatus] = useState<FillStatus | "all">("all");
  const [dataSource, setDataSource] = useState<DataSource | "all">("all");
  const [addOpen, setAddOpen] = useState(false);

  // Filtrujemy po ustaniu pisania - inaczej każdy znak to nowy request.
  const debouncedSearch = useDebounced(search);
  const { data, isLoading, isFetching } = useContainers({
    search: debouncedSearch,
    fraction,
    status,
    dataSource,
  });
  const { data: stations } = useStations();
  const stationById = useMemo(
    () => new Map((stations ?? []).map((s) => [s.id, s.name])),
    [stations],
  );
  const stationName = (id: string) => stationById.get(id) ?? "-";

  // Kafel niesie pilność kolorem, nie pozycją - bez sortowania traci sens.
  const cards = useMemo(() => sortByFill(data ?? []), [data]);
  const filtered = !!debouncedSearch || fraction !== "all" || status !== "all" || dataSource !== "all";

  const columns: Column<Container>[] = [
    { key: "code", header: "Pojemnik", cell: (c) => <span className="font-medium">{c.code}</span> },
    { key: "station", header: "Altanka", cell: (c) => <span className="text-sm text-muted-foreground">{stationName(c.stationId)}</span> },
    { key: "fraction", header: "Frakcja", align: "center", cell: (c) => <FractionBadge fraction={c.fraction} /> },
    { key: "capacity", header: "Pojemność", align: "right", cell: (c) => <span className="text-sm tabular-nums">{c.capacityL} l</span> },
    { key: "fill", header: "Zapełnienie", className: "w-44", cell: (c) => <FillBar level={c.fillLevel} /> },
    { key: "status", header: "Status", align: "center", cell: (c) => <FillStatusBadge status={c.fillStatus} /> },
    { key: "source", header: "Źródło danych", align: "center", cell: (c) => <DataSourceBadge source={c.dataSource} /> },
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
    <div className="space-y-3 sm:space-y-4">
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
      <FilterBar trailing={<ViewToggle value={view} onChange={setView} className="shrink-0 sm:ml-auto" />}>
        <div className="min-w-0 flex-1 sm:min-w-48">
          <Input icon={<Search />} placeholder="Szukaj po kodzie..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
        </div>
        <Select options={FRACTION_OPTIONS} value={fraction} onChange={(e) => setFraction(e.target.value as WasteFraction | "all")} className="h-9 w-full sm:w-44" />
        <Select options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value as FillStatus | "all")} className="h-9 w-full sm:w-44" />
        <Select options={SOURCE_OPTIONS} value={dataSource} onChange={(e) => setDataSource(e.target.value as DataSource | "all")} className="h-9 w-full sm:w-44" />
      </FilterBar>
      <div className={cn("transition-opacity", isFetching && !isLoading && "opacity-60")}>
        {view === "table" ? (
          <DataTable
            columns={columns}
            data={data}
            rowKey={(c) => c.id}
            loading={isLoading}
            onRowClick={(c) => router.push(`/pojemniki/${c.id}`)}
            emptyTitle={filtered ? "Brak pojemników dla tych filtrów" : "Brak pojemników"}
            emptyDescription={filtered ? "Zmień kryteria wyszukiwania lub wyczyść filtry." : undefined}
            pageSize={15}
          />
        ) : isLoading ? (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ContainerCardSkeleton key={i} />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <EmptyState
            title={filtered ? "Brak pojemników dla tych filtrów" : "Brak pojemników"}
            description={filtered ? "Zmień kryteria wyszukiwania lub wyczyść filtry." : undefined}
          />
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {cards.map((c) => (
              <ContainerCard
                key={c.id}
                container={c}
                stationName={stationName(c.stationId)}
                onClick={() => router.push(`/pojemniki/${c.id}`)}
                action={<ChangeFillButton containerCode={c.code} currentLevel={c.fillLevel} variant="ghost" />}
              />
            ))}
          </div>
        )}
      </div>

      {addOpen && <ContainerDialog open onClose={() => setAddOpen(false)} />}
    </div>
  );
}
