"use client";

import { useState } from "react";
import { Bell, BellRing, Check, Search, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import {
  Badge,
  Button,
  DataTable,
  Dialog,
  Field,
  Input,
  Select,
  StatCard,
  type Column,
} from "@/components/ui";
import {
  useMarkPushRead,
  usePushMessages,
  useRegisterPushDevice,
} from "@/lib/api/hooks/use-messages";
import { usePlatformUsers } from "@/lib/api/hooks/use-users";
import type { PushMessage } from "@/lib/types";
import { formatDateTime } from "@/lib/utils/format";

/**
 * Push notification log (`/v1/pushs`) plus device-token registration
 * (POST /v1/pushs/register) for the resident/operator mobile app.
 */

const READ_OPTIONS = [
  { value: "all", label: "Wszystkie" },
  { value: "unread", label: "Nieodczytane" },
  { value: "read", label: "Odczytane" },
];

function RegisterDeviceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const register = useRegisterPushDevice();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function submit() {
    setError(null);
    if (!token.trim()) return setError("Wklej token urządzenia (FCM/APNs).");
    register.mutate(token, {
      onSuccess: () => {
        setOk(true);
        setToken("");
      },
      onError: () => setError("Nie udało się zarejestrować urządzenia."),
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Zarejestruj urządzenie push"
      description="Token urządzenia zostanie powiązany z zalogowanym kontem."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Zamknij
          </Button>
          <Button onClick={submit} loading={register.isPending}>
            Zarejestruj
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Token urządzenia" required>
          {({ id }) => <Input id={id} value={token} onChange={(e) => setToken(e.target.value)} />}
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
        {ok && <p className="text-sm text-success">Urządzenie zarejestrowane.</p>}
      </div>
    </Dialog>
  );
}

export default function PushPage() {
  const [search, setSearch] = useState("");
  const [read, setRead] = useState<"all" | "read" | "unread">("all");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [selected, setSelected] = useState<PushMessage | null>(null);

  const { data, isLoading } = usePushMessages({ search, read });
  const { data: users } = usePlatformUsers();
  const markRead = useMarkPushRead();

  const messages = data ?? [];
  const unread = messages.filter((m) => !m.read).length;
  const emailOf = (id: string | null) => (id ? users?.find((u) => u.id === id)?.email ?? id : "—");

  const columns: Column<PushMessage>[] = [
    {
      key: "title",
      header: "Powiadomienie",
      cell: (m) => (
        <div>
          <p className="font-medium">{m.title}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{m.body}</p>
        </div>
      ),
    },
    { key: "user", header: "Odbiorca", cell: (m) => <span className="text-sm text-muted-foreground">{emailOf(m.userId)}</span> },
    { key: "template", header: "Szablon", cell: (m) => <Badge variant="outline">{m.templateLabel}</Badge> },
    {
      key: "read",
      header: "Odczytane",
      cell: (m) =>
        m.read ? <Badge variant="muted" dot>tak</Badge> : <Badge variant="info" dot>nie</Badge>,
    },
    {
      key: "created",
      header: "Wysłano",
      cell: (m) => <span className="text-sm text-muted-foreground">{formatDateTime(m.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (m) =>
        m.read ? null : (
          <Button
            size="sm"
            variant="outline"
            loading={markRead.isPending && markRead.variables === m.id}
            onClick={(e) => {
              e.stopPropagation();
              markRead.mutate(m.id);
            }}
          >
            <Check /> Oznacz jako odczytane
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Powiadomienia push"
        description="Dziennik powiadomień wysłanych do aplikacji mobilnych."
        actions={
          <Button variant="outline" onClick={() => setRegisterOpen(true)}>
            <Smartphone /> Zarejestruj urządzenie
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Powiadomienia" value={messages.length} icon={Bell} />
        <StatCard label="Nieodczytane" value={unread} icon={BellRing} tone={unread ? "warning" : "default"} />
        <StatCard label="Odczytane" value={messages.length - unread} />
      </div>

      <FilterBar>
        <div className="min-w-56 flex-1">
          <Input
            icon={<Search />}
            placeholder="Szukaj tytułu lub treści..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <Select
          options={READ_OPTIONS}
          value={read}
          onChange={(e) => setRead(e.target.value as "all" | "read" | "unread")}
          className="h-9 w-48"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={messages}
        rowKey={(m) => m.id}
        loading={isLoading}
        onRowClick={(m) => setSelected(m)}
        emptyTitle="Brak powiadomień"
        pageSize={15}
      />

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title}
        description={selected ? formatDateTime(selected.createdAt) : undefined}
        footer={
          <Button variant="ghost" onClick={() => setSelected(null)}>
            Zamknij
          </Button>
        }
      >
        {selected && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{selected.body}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{selected.templateLabel}</Badge>
              <Badge variant={selected.status === "error" ? "danger" : "success"}>{selected.statusLabel}</Badge>
              <Badge variant={selected.read ? "muted" : "info"}>
                {selected.read ? "odczytane" : "nieodczytane"}
              </Badge>
            </div>
          </div>
        )}
      </Dialog>

      <RegisterDeviceDialog open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </div>
  );
}
