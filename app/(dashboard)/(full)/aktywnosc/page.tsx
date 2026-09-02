"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import {
  Badge,
  DataTable,
  DescriptionList,
  Dialog,
  Button,
  Input,
  Select,
  Spinner,
  type Column,
} from "@/components/ui";
import { useActivityTypes, useUserActivities } from "@/lib/api/hooks/use-activities";
import { usePlatformUsers } from "@/lib/api/hooks/use-users";
import type { UserActivity } from "@/lib/types";
import { formatDateTime } from "@/lib/utils/format";

/**
 * Audit log (`/v1/userActivities`) — sign-ins, password changes, locks and
 * domain events, with the originating IP and user agent.
 */
function ActivityList() {
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get("user") ?? "";

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [selected, setSelected] = useState<UserActivity | null>(null);

  const { data, isLoading } = useUserActivities({
    search,
    type: type || undefined,
    userId: userId || undefined,
  });
  const { data: types } = useActivityTypes();
  const { data: users } = usePlatformUsers();

  const emailOf = (id: string | null) =>
    id ? users?.find((u) => u.id === id)?.email ?? id : "—";

  const typeOptions = [
    { value: "", label: "Wszystkie typy" },
    ...(types ?? []).map((t) => ({ value: t.name, label: t.displayName || t.name })),
  ];

  const columns: Column<UserActivity>[] = [
    {
      key: "type",
      header: "Zdarzenie",
      cell: (a) => (
        <div>
          <p className="font-medium">{a.typeLabel}</p>
          {a.message && <p className="text-xs text-muted-foreground">{a.message}</p>}
        </div>
      ),
    },
    {
      key: "user",
      header: "Konto",
      cell: (a) => <span className="text-sm text-muted-foreground">{emailOf(a.userId)}</span>,
    },
    { key: "ip", header: "Adres IP", cell: (a) => <span className="text-sm tabular-nums">{a.ipAddress ?? "—"}</span> },
    {
      key: "device",
      header: "Urządzenie",
      cell: (a) => <span className="text-sm text-muted-foreground">{a.deviceName ?? "—"}</span>,
    },
    {
      key: "created",
      header: "Czas",
      align: "right",
      cell: (a) => <span className="text-sm text-muted-foreground">{formatDateTime(a.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Aktywność użytkowników"
        description="Dziennik audytowy platformy — logowania, zmiany haseł, blokady i zdarzenia domenowe."
      />

      <FilterBar>
        <div className="min-w-56 flex-1">
          <Input
            icon={<Search />}
            placeholder="Szukaj w opisie, typie lub IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <Select options={typeOptions} value={type} onChange={(e) => setType(e.target.value)} className="h-9 w-64" />
      </FilterBar>

      {userId && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtr konta:</span>
          <Badge variant="info">
            {emailOf(userId)}
            <button
              onClick={() => router.push("/aktywnosc")}
              aria-label="Wyczyść filtr konta"
              className="ml-1 rounded-full transition-colors hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </Badge>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        rowKey={(a) => a.id}
        loading={isLoading}
        onRowClick={(a) => setSelected(a)}
        emptyTitle="Brak zdarzeń"
        pageSize={15}
      />

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.typeLabel}
        description={selected ? formatDateTime(selected.createdAt) : undefined}
        className="max-w-xl"
        footer={
          <Button variant="ghost" onClick={() => setSelected(null)}>
            Zamknij
          </Button>
        }
      >
        {selected && (
          <DescriptionList
            columns={1}
            items={[
              { label: "Typ", value: selected.type },
              { label: "Nazwa", value: selected.name ?? "—" },
              { label: "Opis", value: selected.message ?? "—" },
              { label: "Konto", value: emailOf(selected.userId) },
              { label: "Wywołane przez", value: emailOf(selected.creatorId) },
              { label: "Adres IP", value: selected.ipAddress ?? "—" },
              { label: "User agent", value: selected.userAgent ?? "—" },
              { label: "Urządzenie", value: selected.deviceName ?? "—" },
            ]}
          />
        )}
      </Dialog>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Spinner /></div>}>
      <ActivityList />
    </Suspense>
  );
}
