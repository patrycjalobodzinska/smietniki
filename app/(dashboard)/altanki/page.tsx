"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Camera, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import { Button, Input, Select, DataTable, EmptyState, ViewToggle, type Column, type ListView } from "@/components/ui";
import { FillBar } from "@/components/domain/fill-level";
import { VariantBadge, StationStatusBadge } from "@/components/domain/badges";
import { StationDialog } from "@/components/domain/forms/station-dialog";
import { StationCard, StationCardSkeleton, sortByPeakFill } from "@/components/domain/station-card";
import { useStations, useContainers } from "@/lib/api/hooks/use-infrastructure";
import { useDebounced } from "@/lib/utils/use-debounced";
import { useLocalStorage } from "@/lib/utils/use-local-storage";
import type { BinStation, Container, DeploymentVariant, StationStatus } from "@/lib/types";
import { VARIANT_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils/cn";

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

// Klucz z sufiksem wersji: podbicie unieważnia zapisy sprzed zmiany domyślnego
// widoku na kafle - inaczej stara preferencja "table" wygrywałaby z domyślną.
const VIEW_KEY = "altanki:view:v2";
const isListView = (v: string): v is ListView => v === "table" || v === "cards";

export default function StationsPage() {
  const router = useRouter();
  // Wybór widoku zostaje między wejściami na listę.
  const [view, setView] = useLocalStorage<ListView>(VIEW_KEY, "cards", isListView);
  const [search, setSearch] = useState("");
  const [variant, setVariant] = useState<DeploymentVariant | "all">("all");
  const [status, setStatus] = useState<StationStatus | "all">("all");
  const [addOpen, setAddOpen] = useState(false);

  // Filtrujemy po ustaniu pisania - inaczej każdy znak to nowy request.
  const debouncedSearch = useDebounced(search);
  const { data, isLoading, isFetching } = useStations({ search: debouncedSearch, variant, status });
  const filtered = !!debouncedSearch || variant !== "all" || status !== "all";

  // Kafle pokazują rozbicie na pojemniki - tabela go nie potrzebuje, więc
  // pytamy o nie tylko w tym widoku.
  const { data: containers } = useContainers({}, { enabled: view === "cards" });

  const byStation = useMemo(() => {
    const m = new Map<string, Container[]>();
    for (const c of containers ?? []) {
      const arr = m.get(c.stationId);
      if (arr) arr.push(c);
      else m.set(c.stationId, [c]);
    }
    return m;
  }, [containers]);

  // Kafel niesie pilność kolorem, nie pozycją - bez sortowania traci sens.
  const cards = useMemo(() => sortByPeakFill(data ?? [], byStation), [data, byStation]);

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
    { key: "variant", header: "Wariant", align: "center", cell: (s) => <VariantBadge variant={s.deploymentVariant} /> },
    { key: "containers", header: "Pojemniki", align: "center", cell: (s) => <span className="tabular-nums">{s.containerCount}</span> },
    { key: "fill", header: "Śr. zapełnienie", className: "w-44", cell: (s) => <FillBar level={s.avgFillLevel} /> },
    {
      key: "camera",
      header: "Kamera",
      align: "center",
      cell: (s) => (s.hasCamera ? <Camera className="mx-auto size-4 text-info" /> : <span className="text-muted-foreground">-</span>),
    },
    { key: "status", header: "Status", align: "center", cell: (s) => <StationStatusBadge status={s.status} /> },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <PageHeader
        title="Altanki"
          actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Dodaj altankę
          </Button>
        }
      />
      <FilterBar trailing={<ViewToggle value={view} onChange={setView} className="shrink-0 sm:ml-auto" />}>
        <div className="min-w-0 flex-1 sm:min-w-56">
          <Input icon={<Search />} placeholder="Szukaj nazwy, kodu lub adresu..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
        </div>
        <Select options={VARIANT_OPTIONS} value={variant} onChange={(e) => setVariant(e.target.value as DeploymentVariant | "all")} className="h-9 w-full sm:w-52" />
        <Select options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value as StationStatus | "all")} className="h-9 w-full sm:w-44" />
      </FilterBar>
      <div className={cn("transition-opacity", isFetching && !isLoading && "opacity-60")}>
        {view === "table" ? (
          <DataTable
            columns={columns}
            data={data}
            rowKey={(s) => s.id}
            loading={isLoading}
            onRowClick={(s) => router.push(`/altanki/${s.id}`)}
            emptyTitle={filtered ? "Brak altanek dla tych filtrów" : "Brak altanek"}
            emptyDescription={filtered ? "Zmień kryteria wyszukiwania lub wyczyść filtry." : undefined}
            pageSize={15}
          />
        ) : isLoading ? (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <StationCardSkeleton key={i} />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <EmptyState
            title={filtered ? "Brak altanek dla tych filtrów" : "Brak altanek"}
            description={filtered ? "Zmień kryteria wyszukiwania lub wyczyść filtry." : undefined}
          />
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {cards.map((s) => (
              <StationCard
                key={s.id}
                station={s}
                containers={byStation.get(s.id) ?? []}
                onClick={() => router.push(`/altanki/${s.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {addOpen && <StationDialog open onClose={() => setAddOpen(false)} />}
    </div>
  );
}
