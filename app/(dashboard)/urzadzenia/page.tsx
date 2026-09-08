"use client";

import { useState } from "react";
import { Search, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import { Button, Input, Select, Badge, DataTable, StatCard, type Column } from "@/components/ui";
import { DeviceDialog } from "@/components/domain/forms/device-dialog";
import { useDevices } from "@/lib/api/hooks/use-devices";
import { useStations } from "@/lib/api/hooks/use-infrastructure";
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
  const [stationCode, setStationCode] = useState("");
  const [edited, setEdited] = useState<Device | null>(null);

  const { data, isLoading } = useDevices({
    search,
    source,
    online,
    stationCode: stationCode || undefined,
  });
  const { data: stations } = useStations();

  const devices = data ?? [];
  const onlineCount = devices.filter((d) => d.online).length;
  const unassigned = devices.filter((d) => !d.stationCode).length;

  const stationOptions = [
    { value: "", label: "Wszystkie altanki" },
    ...(stations ?? []).map((s) => ({ value: s.code, label: `${s.code} · ${s.name}` })),
  ];

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
    { key: "source", header: "Źródło", align: "center", cell: (d) => <Badge variant={SOURCE_VARIANT[d.source]}>{SOURCE_LABEL[d.source]}</Badge> },
    {
      key: "station",
      header: "Przypisanie",
      cell: (d) =>
        d.stationCode ? (
          <div>
            <p className="text-sm">{d.stationCode}</p>
            {/* Czytnik RFID obsługuje wejście do altanki - kod pojemnika, gdyby
                został w danych, nie ma tu znaczenia. */}
            {d.source !== "rfid" && d.containerCode && (
              <p className="text-xs text-muted-foreground">{d.containerCode}</p>
            )}
          </div>
        ) : (
          <Badge variant="warning">brak przypisania</Badge>
        ),
    },
    { key: "events", header: "Zdarzenia", align: "right", cell: (d) => <span className="tabular-nums">{d.eventCount.toLocaleString("pl-PL")}</span> },
    { key: "lastSeen", header: "Ostatnie zdarzenie", cell: (d) => <span className="text-sm text-muted-foreground">{d.lastSeenAt ? formatRelative(d.lastSeenAt) : "-"}</span> },
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
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (d) => (
        <Button size="sm" variant="outline" onClick={() => setEdited(d)}>
          <Settings2 /> Konfiguruj
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <PageHeader title="Urządzenia" />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Urządzenia" value={devices.length} />
        <StatCard label="Online" value={onlineCount} tone={onlineCount ? "success" : "default"} />
        <StatCard label="Offline" value={devices.length - onlineCount} tone={devices.length - onlineCount ? "warning" : "default"} />
        <StatCard
          label="Bez przypisania"
          value={unassigned}
          tone={unassigned ? "warning" : "default"}
        />
      </div>
      <FilterBar>
        <div className="min-w-0 flex-1 sm:min-w-56">
          <Input icon={<Search />} placeholder="Szukaj nazwy, klucza lub altanki..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
        </div>
        <Select options={SOURCE_OPTIONS} value={source} onChange={(e) => setSource(e.target.value as DeviceSource | "all")} className="h-9 w-full sm:w-48" />
        <Select options={STATUS_OPTIONS} value={online} onChange={(e) => setOnline(e.target.value as "all" | "online" | "offline")} className="h-9 w-full sm:w-44" />
        <Select options={stationOptions} value={stationCode} onChange={(e) => setStationCode(e.target.value)} className="h-9 w-full sm:w-56" />
      </FilterBar>
      <DataTable columns={columns} data={devices} rowKey={(d) => d.id} loading={isLoading} emptyTitle="Brak urządzeń" pageSize={15} />

      {edited && <DeviceDialog open device={edited} onClose={() => setEdited(null)} />}
    </div>
  );
}
