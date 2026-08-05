"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import { Input, Select, Badge, Button, DataTable, type Column } from "@/components/ui";
import { useAccessKeys, useRevokeAccessKey } from "@/lib/api/hooks/use-keys";
import type { AccessKey, KeyType } from "@/lib/types";
import { KEY_TYPE_LABEL } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils/format";

const STATUS_OPTIONS = [
  { value: "all", label: "Wszystkie statusy" },
  { value: "active", label: "Aktywne" },
  { value: "revoked", label: "Unieważnione" },
];
const TYPE_OPTIONS = [
  { value: "all", label: "Wszystkie typy" },
  { value: "rfid", label: "RFID" },
  { value: "mobile", label: "Mobilny" },
  { value: "physical", label: "Fizyczny" },
];

export default function KeysPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "revoked">("all");
  const [keyType, setKeyType] = useState<KeyType | "all">("all");

  const { data, isLoading } = useAccessKeys({ search, status, keyType });
  const revoke = useRevokeAccessKey();

  const columns: Column<AccessKey>[] = [
    { key: "id", header: "Identyfikator", cell: (k) => <span className="font-medium">{k.keyIdentifier}</span> },
    { key: "type", header: "Typ", cell: (k) => <Badge variant="outline">{KEY_TYPE_LABEL[k.keyType]}</Badge> },
    {
      key: "status",
      header: "Status",
      cell: (k) =>
        k.status === "active" ? (
          <Badge variant="success" dot>Aktywny</Badge>
        ) : (
          <Badge variant="muted" dot>Unieważniony</Badge>
        ),
    },
    { key: "issued", header: "Wydano", cell: (k) => <span className="text-sm text-muted-foreground">{formatDateTime(k.issuedAt)}</span> },
    { key: "revoked", header: "Unieważniono", cell: (k) => <span className="text-sm text-muted-foreground">{k.revokedAt ? formatDateTime(k.revokedAt) : "—"}</span> },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (k) =>
        k.status === "active" ? (
          <Button
            variant="danger"
            size="sm"
            loading={revoke.isPending && revoke.variables === k.id}
            onClick={() => {
              if (confirm(`Unieważnić klucz ${k.keyIdentifier}?`)) revoke.mutate(k.id);
            }}
          >
            Unieważnij
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Klucze dostępu" description="Wydane klucze/karty RFID i kontrola ich statusu." />
      <FilterBar>
        <div className="min-w-56 flex-1">
          <Input icon={<Search />} placeholder="Szukaj po identyfikatorze..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
        </div>
        <Select options={TYPE_OPTIONS} value={keyType} onChange={(e) => setKeyType(e.target.value as KeyType | "all")} className="h-9 w-44" />
        <Select options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value as "all" | "active" | "revoked")} className="h-9 w-48" />
      </FilterBar>
      <DataTable columns={columns} data={data} rowKey={(k) => k.id} loading={isLoading} emptyTitle="Brak kluczy" />
    </div>
  );
}
