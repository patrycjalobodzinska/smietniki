"use client";

import { useState } from "react";
import { Plus, Search, Truck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import { Button, DataTable, Input, StatCard, type Column } from "@/components/ui";
import { VehicleStatusBadge } from "@/components/domain/badges";
import { VehicleDialog } from "@/components/domain/forms/vehicle-dialog";
import { useVehicles } from "@/lib/api/hooks/use-operations";
import type { Vehicle } from "@/lib/types";

/** Collection fleet (GET/POST /v1/vehicles) — vehicles referenced by routes and pickups. */
export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const { data, isLoading } = useVehicles();

  const includesCI = (v: string) => v.toLowerCase().includes(search.toLowerCase());
  const vehicles = (data ?? []).filter((v) => !search || includesCI(v.code) || includesCI(v.operator));
  const available = vehicles.filter((v) => v.status === "available").length;

  const columns: Column<Vehicle>[] = [
    { key: "code", header: "Pojazd", cell: (v) => <span className="font-medium">{v.code}</span> },
    { key: "operator", header: "Operator", cell: (v) => <span className="text-sm">{v.operator}</span> },
    {
      key: "capacity",
      header: "Pojemność nominalna",
      align: "right",
      cell: (v) => (
        <span className="text-sm tabular-nums">
          {v.nominalCapacityKg ? v.nominalCapacityKg.toLocaleString("pl-PL") : "—"}
        </span>
      ),
    },
    { key: "status", header: "Status", cell: (v) => <VehicleStatusBadge status={v.status} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pojazdy"
        description="Flota realizująca odbiory — przypisywana do tras i pojedynczych odbiorów."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus /> Dodaj pojazd
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Pojazdy" value={vehicles.length} icon={Truck} />
        <StatCard label="Dostępne" value={available} tone={available ? "success" : "default"} />
        <StatCard label="Niedostępne" value={vehicles.length - available} />
      </div>

      <FilterBar>
        <div className="min-w-56 flex-1">
          <Input
            icon={<Search />}
            placeholder="Szukaj oznaczenia lub operatora..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
      </FilterBar>

      <DataTable
        columns={columns}
        data={vehicles}
        rowKey={(v) => v.id}
        loading={isLoading}
        emptyTitle="Brak pojazdów"
        emptyDescription="Dodaj pierwszy pojazd, aby przypisywać go do tras i odbiorów."
        pageSize={15}
      />

      {addOpen && <VehicleDialog open onClose={() => setAddOpen(false)} />}
    </div>
  );
}
