"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import { Input, Select, Badge, Button, DataTable, Dialog, Field, type Column } from "@/components/ui";
import {
  useAccessKeys,
  useRevokeAccessKey,
  useIssueAccessKey,
  useKeyUnits,
} from "@/lib/api/hooks/use-keys";
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
const ISSUE_TYPE_OPTIONS = [
  { value: "rfid", label: "RFID" },
  { value: "mobile", label: "Mobilny" },
  { value: "physical", label: "Fizyczny" },
];

function IssueKeyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: units, isLoading: unitsLoading } = useKeyUnits(open);
  const issue = useIssueAccessKey();

  const [unitId, setUnitId] = useState("");
  const [keyType, setKeyType] = useState<KeyType>("rfid");
  const [keyIdentifier, setKeyIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setUnitId("");
    setKeyType("rfid");
    setKeyIdentifier("");
    setError(null);
  }

  function close() {
    reset();
    onClose();
  }

  function submit() {
    setError(null);
    if (!unitId) return setError("Wybierz lokal, do którego przypisać klucz.");
    if (!keyIdentifier.trim()) return setError("Podaj identyfikator klucza / karty.");
    issue.mutate(
      { unitId, keyType, keyIdentifier },
      {
        onSuccess: close,
        onError: () => setError("Nie udało się wydać klucza. Spróbuj ponownie."),
      },
    );
  }

  const unitOptions = [
    { value: "", label: unitsLoading ? "Ładowanie lokali…" : "— wybierz lokal —" },
    ...(units ?? []).map((u) => ({ value: u.id, label: u.label })),
  ];

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Wydaj klucz"
      description="Przypisz nowy klucz/kartę RFID do lokalu."
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Anuluj
          </Button>
          <Button onClick={submit} loading={issue.isPending}>
            Wydaj klucz
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Lokal" required>
          {({ id }) => (
            <Select
              id={id}
              options={unitOptions}
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              disabled={unitsLoading}
            />
          )}
        </Field>
        <Field label="Typ klucza" required>
          {({ id }) => (
            <Select
              id={id}
              options={ISSUE_TYPE_OPTIONS}
              value={keyType}
              onChange={(e) => setKeyType(e.target.value as KeyType)}
            />
          )}
        </Field>
        <Field label="Identyfikator klucza / karty" required hint="Np. numer karty RFID lub oznaczenie klucza.">
          {({ id }) => (
            <Input
              id={id}
              placeholder="np. RFID-000123"
              value={keyIdentifier}
              onChange={(e) => setKeyIdentifier(e.target.value)}
            />
          )}
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Dialog>
  );
}

export default function KeysPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "revoked">("all");
  const [keyType, setKeyType] = useState<KeyType | "all">("all");
  const [issueOpen, setIssueOpen] = useState(false);

  const { data, isLoading } = useAccessKeys({ search, status, keyType });
  const revoke = useRevokeAccessKey();

  const columns: Column<AccessKey>[] = [
    { key: "id", header: "Identyfikator", cell: (k) => <span className="font-medium">{k.keyIdentifier}</span> },
    {
      key: "unit",
      header: "Lokal",
      cell: (k) =>
        k.unitNumber ? (
          <span className="text-sm">Lokal {k.unitNumber}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
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
      <PageHeader
        title="Klucze dostępu"
        description="Wydane klucze/karty RFID przypisane do lokali i kontrola ich statusu."
        actions={
          <Button onClick={() => setIssueOpen(true)}>
            <Plus className="size-4" />
            Wydaj klucz
          </Button>
        }
      />
      <FilterBar>
        <div className="min-w-56 flex-1">
          <Input icon={<Search />} placeholder="Szukaj po identyfikatorze..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
        </div>
        <Select options={TYPE_OPTIONS} value={keyType} onChange={(e) => setKeyType(e.target.value as KeyType | "all")} className="h-9 w-44" />
        <Select options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value as "all" | "active" | "revoked")} className="h-9 w-48" />
      </FilterBar>
      <DataTable columns={columns} data={data} rowKey={(k) => k.id} loading={isLoading} emptyTitle="Brak kluczy" pageSize={15} />

      <IssueKeyDialog open={issueOpen} onClose={() => setIssueOpen(false)} />
    </div>
  );
}
