"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import { Input, Select, Badge, DataTable, type Column } from "@/components/ui";
import { useDevices } from "@/lib/api/hooks/use-devices";
import type { Device, DeviceSource } from "@/lib/types";
import { formatRelative } from "@/lib/utils/format";

const SOURCE_LABEL: Record<DeviceSource, string> = {
  camera: "Kamera",
  rfid: "RFID",
  thermal: "Termiczna",
  unknown: "Inne",
};
const SOURCE_VARIANT: Record<DeviceSource, "info" | "primary" | "warning" | "muted"> = {
  camera: "info",
  rfid: "primary",
  thermal: "warning",
  unknown: "muted",
};

const SOURCE_OPTIONS = [
  { value: "all", label: "Wszystkie źródła" },
  { value: "camera", label: "Kamera" },
  { value: "rfid", label: "RFID" },
  { value: "thermal", label: "Termiczna" },
];
const STATUS_OPTIONS = [
  { value: "all", label: "Wszystkie statusy" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
];

export default function DevicesPage() {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<DeviceSource | "all">("all");
  const [online, setOnline] = useState<"all" | "online" | "offline">("all");

  const { data, isLoading } = useDevices({ search, source, online });

  const columns: Column<Device>[] = [
    {
      key: "name",
      header: "Urządzenie",
      cell: (d) => (
        <div>
          <p className="font-medium">{d.name}</p>
          <p className="text-xs text-muted-foreground">{d.deviceKey}</p>
        </div>
      ),
    },
    { key: "source", header: "Źródło", cell: (d) => <Badge variant={SOURCE_VARIANT[d.source]}>{SOURCE_LABEL[d.source]}</Badge> },
    { key: "station", header: "Altanka", cell: (d) => <span className="text-sm text-muted-foreground">{d.stationCode ?? "—"}</span> },
    { key: "events", header: "Zdarzenia", align: "right", cell: (d) => <span className="tabular-nums">{d.eventCount.toLocaleString("pl-PL")}</span> },
    { key: "lastSeen", header: "Ostatnie zdarzenie", cell: (d) => <span className="text-sm text-muted-foreground">{d.lastSeenAt ? formatRelative(d.lastSeenAt) : "—"}</span> },
    {
      key: "status",
      header: "Status",
      cell: (d) =>
        d.online ? (
          <Badge variant="success" dot>Online</Badge>
        ) : (
          <Badge variant="muted" dot>Offline</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Urządzenia" description="Urządzenia OT (kamery, czytniki RFID) i ich stan łączności." />
      <FilterBar>
        <div className="min-w-56 flex-1">
          <Input icon={<Search />} placeholder="Szukaj nazwy, klucza lub altanki..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
        </div>
        <Select options={SOURCE_OPTIONS} value={source} onChange={(e) => setSource(e.target.value as DeviceSource | "all")} className="h-9 w-48" />
        <Select options={STATUS_OPTIONS} value={online} onChange={(e) => setOnline(e.target.value as "all" | "online" | "offline")} className="h-9 w-44" />
      </FilterBar>
      <DataTable columns={columns} data={data} rowKey={(d) => d.id} loading={isLoading} emptyTitle="Brak urządzeń" />
    </div>
  );
}
