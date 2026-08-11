"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Video } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import { Input, Select, Badge, DataTable, type Column } from "@/components/ui";
import { AnomalyBadge } from "@/components/domain/badges";
import { useSessions } from "@/lib/api/hooks/use-operations";
import type { AccessSession } from "@/lib/types";
import { KEY_TYPE_LABEL } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils/format";

const ANOMALY_OPTIONS = [
  { value: "all", label: "Wszystkie sesje" },
  { value: "yes", label: "Tylko anomalie" },
  { value: "no", label: "Bez anomalii" },
];

function duration(sec: number | null) {
  if (sec === null) return "N/D";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? `${m} min ${s}s` : `${s}s`;
}

export default function SessionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [anomaly, setAnomaly] = useState("all");

  const { data, isLoading } = useSessions({
    search,
    anomaly: anomaly === "all" ? undefined : anomaly === "yes",
  });

  const columns: Column<AccessSession>[] = [
    { key: "station", header: "Altanka", cell: (s) => <span className="font-medium">{s.stationName}</span> },
    { key: "key", header: "Klucz / lokal", cell: (s) => <div><p className="text-sm">{s.keyIdentifier}</p>{s.unitNumber && <p className="text-xs text-muted-foreground">Lokal {s.unitNumber}</p>}</div> },
    { key: "type", header: "Typ klucza", cell: (s) => <Badge variant="outline">{KEY_TYPE_LABEL[s.keyType]}</Badge> },
    { key: "started", header: "Rozpoczęcie", cell: (s) => <span className="text-sm text-muted-foreground">{formatDateTime(s.startedAt)}</span> },
    { key: "duration", header: "Czas trwania", align: "right", cell: (s) => <span className="text-sm tabular-nums">{duration(s.durationSeconds)}</span> },
    { key: "recording", header: "Nagranie", align: "center", cell: (s) => (s.hasRecording ? <Video className="mx-auto size-4 text-info" /> : <span className="text-muted-foreground">—</span>) },
    { key: "anomaly", header: "Anomalia", cell: (s) => (s.anomaly ? <AnomalyBadge /> : <span className="text-sm text-muted-foreground">—</span>) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Sesje dostępu" description="Historia autoryzacji dostępu do altanek." />
      <FilterBar>
        <div className="min-w-48 flex-1">
          <Input icon={<Search />} placeholder="Szukaj klucza, altanki, lokalu..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
        </div>
        <Select options={ANOMALY_OPTIONS} value={anomaly} onChange={(e) => setAnomaly(e.target.value)} className="h-9 w-48" />
      </FilterBar>
      <DataTable columns={columns} data={data} rowKey={(s) => s.id} loading={isLoading} onRowClick={(s) => router.push(`/sesje/${s.id}`)} emptyTitle="Brak sesji" />
    </div>
  );
}
