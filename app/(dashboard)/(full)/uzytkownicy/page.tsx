"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, LockOpen, Mail, Search, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import {
  Badge,
  Button,
  DataTable,
  DescriptionList,
  Dialog,
  Input,
  Select,
  StatCard,
  type Column,
} from "@/components/ui";
import {
  usePlatformUsers,
  useSendConfirmationEmail,
  useToggleUserLock,
  useUserRoles,
} from "@/lib/api/hooks/use-users";
import type { PlatformUser, PlatformUserState } from "@/lib/types";
import { formatDateTime } from "@/lib/utils/format";

/**
 * Platform accounts (`/v1/users`) - who can sign in, with which system role,
 * plus locking and re-sending the address-confirmation e-mail.
 */

const STATE_OPTIONS = [
  { value: "all", label: "Wszystkie konta" },
  { value: "active", label: "Aktywne" },
  { value: "locked", label: "Zablokowane" },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [state, setState] = useState<PlatformUserState | "all">("all");
  const [selected, setSelected] = useState<PlatformUser | null>(null);

  const { data, isLoading } = usePlatformUsers({ search, role: role || undefined, state });
  const { data: roles } = useUserRoles();
  const toggleLock = useToggleUserLock();
  const sendConfirmation = useSendConfirmationEmail();

  const users = data ?? [];
  const locked = users.filter((u) => u.state === "locked").length;
  const unconfirmed = users.filter((u) => !u.emailConfirmed).length;

  const roleOptions = [
    { value: "", label: "Wszystkie role" },
    ...(roles ?? []).map((r) => ({ value: r.name, label: r.displayName || r.name })),
  ];

  const columns: Column<PlatformUser>[] = [
    { key: "email", header: "Konto", cell: (u) => <span className="font-medium">{u.email}</span> },
    {
      key: "roles",
      header: "Role",
      cell: (u) =>
        u.roles.length ? (
          <div className="flex flex-wrap gap-1">
            {u.roles.map((r) => (
              <Badge key={r} variant="outline">
                {r}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      key: "state",
      header: "Status",
      cell: (u) =>
        u.state === "locked" ? (
          <Badge variant="danger" dot>Zablokowane</Badge>
        ) : (
          <Badge variant="success" dot>Aktywne</Badge>
        ),
    },
    {
      key: "confirmed",
      header: "Email",
      cell: (u) =>
        u.emailConfirmed ? (
          <Badge variant="success">potwierdzony</Badge>
        ) : (
          <Badge variant="warning">niepotwierdzony</Badge>
        ),
    },
    {
      key: "created",
      header: "Utworzone",
      cell: (u) => <span className="text-sm text-muted-foreground">{formatDateTime(u.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (u) => (
        <Button
          size="sm"
          variant={u.state === "locked" ? "outline" : "danger"}
          loading={toggleLock.isPending && toggleLock.variables?.id === u.id}
          onClick={(e) => {
            e.stopPropagation();
            const lock = u.state !== "locked";
            if (confirm(`${lock ? "Zablokować" : "Odblokować"} konto ${u.email}?`))
              toggleLock.mutate({ id: u.id, lock });
          }}
        >
          {u.state === "locked" ? <LockOpen /> : <Lock />}
          {u.state === "locked" ? "Odblokuj" : "Zablokuj"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <PageHeader title="Użytkownicy" />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
        <StatCard label="Konta" value={users.length} icon={Users} />
        <StatCard label="Zablokowane" value={locked} tone={locked ? "danger" : "default"} />
        <StatCard label="Niepotwierdzone" value={unconfirmed} tone={unconfirmed ? "warning" : "default"} />
      </div>

      <FilterBar>
        <div className="min-w-0 flex-1 sm:min-w-56">
          <Input
            icon={<Search />}
            placeholder="Szukaj adresu e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <Select options={roleOptions} value={role} onChange={(e) => setRole(e.target.value)} className="h-9 w-full sm:w-44" />
        <Select
          options={STATE_OPTIONS}
          value={state}
          onChange={(e) => setState(e.target.value as PlatformUserState | "all")}
          className="h-9 w-full sm:w-48"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={users}
        rowKey={(u) => u.id}
        loading={isLoading}
        onRowClick={(u) => setSelected(u)}
        emptyTitle="Brak użytkowników"
        pageSize={15}
      />

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.email}
        description="Konto platformy"
        className="max-w-xl"
        footer={
          <>
            <Button
              variant="outline"
              loading={sendConfirmation.isPending}
              onClick={() => selected && sendConfirmation.mutate(selected.id)}
            >
              <Mail /> Wyślij e-mail potwierdzający
            </Button>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Zamknij
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-3 sm:space-y-4">
            <DescriptionList
              columns={2}
              items={[
                { label: "Identyfikator", value: <span className="text-xs">{selected.id}</span> },
                { label: "Role", value: selected.roles.join(", ") || "-" },
                { label: "Status", value: selected.state === "locked" ? "Zablokowane" : "Aktywne" },
                { label: "Email potwierdzony", value: selected.emailConfirmed ? "tak" : "nie" },
                {
                  label: "Telefon",
                  value: selected.phone
                    ? `${selected.phonePrefix ? `+${selected.phonePrefix} ` : ""}${selected.phone}`
                    : "-",
                },
                { label: "Telefon potwierdzony", value: selected.phoneConfirmed ? "tak" : "nie" },
                { label: "Utworzone", value: formatDateTime(selected.createdAt) },
                {
                  label: "Ostatnia zmiana hasła",
                  value: selected.lastPasswordChangeAt ? formatDateTime(selected.lastPasswordChangeAt) : "-",
                },
                { label: "Rejestracja", value: selected.registrationProvider ?? "-" },
              ]}
            />
            <Link
              href={`/aktywnosc?user=${selected.id}`}
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Aktywność tego konta →
            </Link>
          </div>
        )}
      </Dialog>
    </div>
  );
}
