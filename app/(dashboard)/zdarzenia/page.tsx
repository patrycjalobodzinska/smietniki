"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Camera, RefreshCw, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import {
  Badge,
  Button,
  DataTable,
  DatePicker,
  DescriptionList,
  Dialog,
  Input,
  Select,
  Spinner,
  StatCard,
  type Column,
} from "@/components/ui";
import { SnapshotImage } from "@/components/domain/snapshot-image";
import { useRawEvents } from "@/lib/api/hooks/use-events";
import type { DeviceSource, RawEvent } from "@/lib/types";
import { eventTypeLabel } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils/format";

/**
 * Ingest diagnostics (GET /v1/raw-events): every frame, RFID swipe and fill
 * reading the devices pushed, with retransmissions and camera snapshots.
 */

const SOURCE_LABEL: Record<DeviceSource, string> = {
  camera: "Kamera",
  rfid: "RFID",
  thermal: "Termiczna",
  unknown: "Nieznane",
};
const SOURCE_VARIANT: Record<DeviceSource, "info" | "primary" | "warning" | "muted"> = {
  camera: "info",
  rfid: "primary",
  thermal: "warning",
  unknown: "muted",
};
const SOURCE_OPTIONS = [
  { value: "all", label: "Wszystkie źródła" },
  ...(Object.keys(SOURCE_LABEL) as DeviceSource[]).map((s) => ({ value: s, label: SOURCE_LABEL[s] })),
];
const KIND_OPTIONS = [
  { value: "all", label: "Wszystkie zdarzenia" },
  { value: "snapshots", label: "Tylko ze zdjęciem" },
  { value: "retransmissions", label: "Tylko retransmisje" },
];

/** Ingest lag: how long the event took to reach the platform. */
function lag(e: RawEvent): string {
  const ms = +new Date(e.receivedAt) - +new Date(e.occurredAt);
  if (!Number.isFinite(ms)) return "-";
  const s = Math.round(ms / 1000);
  if (Math.abs(s) < 60) return `${s} s`;
  return `${Math.round(s / 60)} min`;
}

function RawEventsList() {
  const params = useSearchParams();
  const [eventType, setEventType] = useState("");
  const [pid, setPid] = useState(params.get("pid") ?? "");
  const [source, setSource] = useState<DeviceSource | "all">("all");
  const [kind, setKind] = useState<"all" | "snapshots" | "retransmissions">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<RawEvent | null>(null);

  const { data, isLoading } = useRawEvents({
    source,
    eventType: eventType || undefined,
    pid: pid || undefined,
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(to).toISOString() : undefined,
    onlySnapshots: kind === "snapshots",
    onlyRetransmissions: kind === "retransmissions",
  });

  const events = data ?? [];
  const withSnapshot = events.filter((e) => e.hasSnapshot).length;
  const retransmissions = events.filter((e) => e.isRetransmission).length;
  const withFill = events.filter((e) => e.fillValue !== null).length;

  const columns: Column<RawEvent>[] = [
    {
      key: "occurred",
      header: "Zdarzenie",
      cell: (e) => (
        <div>
          <p className="font-medium">{formatDateTime(e.occurredAt)}</p>
          <p className="text-xs text-muted-foreground">{eventTypeLabel(e.eventType)}</p>
        </div>
      ),
    },
    {
      key: "source",
      header: "Źródło",
      align: "center",
      cell: (e) => <Badge variant={SOURCE_VARIANT[e.source]}>{SOURCE_LABEL[e.source]}</Badge>,
    },
    {
      key: "device",
      header: "Urządzenie",
      cell: (e) => (
        <span className="text-sm text-muted-foreground">
          {e.deviceIp ?? "-"}
          {e.channelId !== null ? ` · kanał ${e.channelId}` : ""}
        </span>
      ),
    },
    {
      key: "fill",
      header: "Zapełnienie",
      align: "center",
      cell: (e) =>
        e.fillValue === null ? (
          <span className="text-muted-foreground">-</span>
        ) : (
          <span className="tabular-nums">{Math.round(e.fillValue)}%</span>
        ),
    },
    {
      key: "snapshot",
      header: "Obraz",
      align: "center",
      cell: (e) =>
        e.hasSnapshot && e.snapshotId ? (
          <Camera className="mx-auto size-4 text-info" />
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "retrans",
      header: "Retransmisja",
      align: "center",
      cell: (e) =>
        e.isRetransmission ? (
          <Badge variant="warning">
            <RefreshCw className="size-3" />×{e.retransmissionCount}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">nie</span>
        ),
    },
    { key: "lag", header: "Opóźnienie", align: "right", cell: (e) => <span className="text-sm tabular-nums">{lag(e)}</span> },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <PageHeader
        title="Zdarzenia z urządzeń"
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Zdarzenia (filtr)" value={events.length} />
        <StatCard label="Ze zdjęciem" value={withSnapshot} />
        <StatCard label="Z pomiarem zapełnienia" value={withFill} />
        <StatCard label="Retransmisje" value={retransmissions} tone={retransmissions ? "warning" : "default"} />
      </div>

      <FilterBar>
        <div className="min-w-44 flex-1">
          <Input
            icon={<Search />}
            placeholder="Typ zdarzenia..."
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="h-9"
          />
        </div>
        <Input placeholder="PID" value={pid} onChange={(e) => setPid(e.target.value)} className="h-9 w-full sm:w-40" />
        <Select
          options={SOURCE_OPTIONS}
          value={source}
          onChange={(e) => setSource(e.target.value as DeviceSource | "all")}
          className="h-9 w-full sm:w-44"
        />
        <Select
          options={KIND_OPTIONS}
          value={kind}
          onChange={(e) => setKind(e.target.value as "all" | "snapshots" | "retransmissions")}
          className="h-9 w-full sm:w-52"
        />
        <DatePicker value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-full sm:w-44" aria-label="Data od" placeholder="Data od…" />
        <DatePicker value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-full sm:w-44" aria-label="Data do" placeholder="Data do…" />
      </FilterBar>

      <DataTable
        columns={columns}
        data={events}
        rowKey={(e) => e.id}
        loading={isLoading}
        onRowClick={(e) => setSelected(e)}
        emptyTitle="Brak zdarzeń"
        emptyDescription="Żadne zdarzenie nie odpowiada wybranym filtrom."
        pageSize={15}
      />

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Zdarzenie ingestu"
        description={selected ? formatDateTime(selected.occurredAt) : undefined}
        className="max-w-2xl"
        footer={
          <Button variant="ghost" onClick={() => setSelected(null)}>
            Zamknij
          </Button>
        }
      >
        {selected && (
          <div className="space-y-3 sm:space-y-4">
            {selected.hasSnapshot && selected.snapshotId && (
              <SnapshotImage
                snapshotId={selected.snapshotId}
                alt="Zdjęcie zdarzenia"
                ratio="video"
                className="w-full rounded-xl border border-border"
              />
            )}
            <DescriptionList
              columns={2}
              items={[
                { label: "Źródło", value: SOURCE_LABEL[selected.source] },
                { label: "Typ zdarzenia", value: eventTypeLabel(selected.eventType) },
                { label: "PID", value: selected.pid ?? "-" },
                { label: "Adres IP", value: selected.deviceIp ?? "-" },
                { label: "Kanał", value: selected.channelId ?? "-" },
                { label: "Zapełnienie", value: selected.fillValue === null ? "-" : `${Math.round(selected.fillValue)}%` },
                { label: "Czas zdarzenia", value: formatDateTime(selected.occurredAt) },
                { label: "Czas odbioru", value: formatDateTime(selected.receivedAt) },
                { label: "Opóźnienie", value: lag(selected) },
                {
                  label: "Retransmisja",
                  value: selected.isRetransmission ? `tak (×${selected.retransmissionCount})` : "nie",
                },
              ]}
            />
          </div>
        )}
      </Dialog>
    </div>
  );
}

export default function RawEventsPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Spinner /></div>}>
      <RawEventsList />
    </Suspense>
  );
}
