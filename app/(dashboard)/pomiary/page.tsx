"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import { Button, DataTable, DatePicker, Input, Select, StatCard, type Column } from "@/components/ui";
import { FillBar } from "@/components/domain/fill-level";
import { DataSourceBadge } from "@/components/domain/badges";
import { MeasurementDialog } from "@/components/domain/forms/measurement-dialog";
import { ChangeFillButton } from "@/components/domain/change-fill-button";
import { useFillMeasurements } from "@/lib/api/hooks/use-fill";
import { useContainers } from "@/lib/api/hooks/use-infrastructure";
import type { DataSource, FillMeasurement } from "@/lib/types";
import { DATA_SOURCE_LABEL } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils/format";

/**
 * Fill telemetry feed (GET /v1/fill/measurements) - the raw readings behind
 * every level shown in the app, plus manual entry for sensorless altankas.
 */

const SOURCE_OPTIONS = [
  { value: "all", label: "Każde źródło" },
  ...(Object.keys(DATA_SOURCE_LABEL) as DataSource[]).map((s) => ({
    value: s,
    label: DATA_SOURCE_LABEL[s],
  })),
];

export default function MeasurementsPage() {
  const router = useRouter();
  const [containerCode, setContainerCode] = useState("");
  const [deviceKey, setDeviceKey] = useState("");
  const [source, setSource] = useState<DataSource | "all">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const { data, isLoading } = useFillMeasurements({
    containerCode: containerCode || undefined,
    deviceKey: deviceKey || undefined,
    source,
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(to).toISOString() : undefined,
  });
  const { data: containers } = useContainers();
  const containerId = (code: string | null) =>
    code ? containers?.find((c) => c.code === code)?.id : undefined;

  const rows = data ?? [];
  const auto = rows.filter((m) => m.source === "auto").length;
  const manual = rows.filter((m) => m.source === "manual").length;
  const avg = rows.length ? Math.round(rows.reduce((s, m) => s + m.value, 0) / rows.length) : null;

  const containerOptions = [
    { value: "", label: "Wszystkie pojemniki" },
    ...(containers ?? []).map((c) => ({ value: c.code, label: c.code })),
  ];

  const columns: Column<FillMeasurement>[] = [
    { key: "container", header: "Pojemnik", cell: (m) => <span className="font-medium">{m.containerCode ?? "-"}</span> },
    { key: "value", header: "Zapełnienie", className: "w-44", cell: (m) => <FillBar level={m.value} /> },
    { key: "source", header: "Źródło", align: "center", cell: (m) => <DataSourceBadge source={m.source} /> },
    {
      key: "device",
      header: "Urządzenie",
      cell: (m) => <span className="text-sm text-muted-foreground">{m.deviceKey ?? "wpis ręczny"}</span>,
    },
    {
      key: "measured",
      header: "Czas pomiaru",
      cell: (m) => <span className="text-sm text-muted-foreground">{formatDateTime(m.measuredAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "w-16",
      cell: (m) =>
        m.containerCode ? (
          <ChangeFillButton containerCode={m.containerCode} currentLevel={m.value} />
        ) : null,
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <PageHeader
        title="Pomiary zapełnienia"
        description="Odczyty automatyczne i wpisy ręczne."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Zmień zapełnienie
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Pomiary (filtr)" value={rows.length} />
        <StatCard label="Automatyczne" value={auto} />
        <StatCard label="Ręczne" value={manual} />
        <StatCard label="Średnie zapełnienie" value={avg === null ? "N/D" : `${avg}%`} />
      </div>

      <FilterBar>
        <Select
          options={containerOptions}
          value={containerCode}
          onChange={(e) => setContainerCode(e.target.value)}
          className="h-9 w-full sm:w-52"
        />
        <div className="min-w-44 flex-1">
          <Input
            icon={<Search />}
            placeholder="Klucz urządzenia..."
            value={deviceKey}
            onChange={(e) => setDeviceKey(e.target.value)}
            className="h-9"
          />
        </div>
        <Select
          options={SOURCE_OPTIONS}
          value={source}
          onChange={(e) => setSource(e.target.value as DataSource | "all")}
          className="h-9 w-full sm:w-44"
        />
        <DatePicker value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-full sm:w-44" aria-label="Data od" placeholder="Data od…" />
        <DatePicker value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-full sm:w-44" aria-label="Data do" placeholder="Data do…" />
      </FilterBar>

      <DataTable
        columns={columns}
        data={rows}
        rowKey={(m) => m.id}
        loading={isLoading}
        onRowClick={(m) => {
          const id = containerId(m.containerCode);
          if (id) router.push(`/pojemniki/${id}`);
        }}
        emptyTitle="Brak pomiarów"
        emptyDescription="Dla wybranych filtrów nie ma odczytów zapełnienia."
        pageSize={15}
      />

      <MeasurementDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
