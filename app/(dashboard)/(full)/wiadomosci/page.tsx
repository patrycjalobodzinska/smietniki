"use client";

import { useState } from "react";
import { Mail, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/layout/filter-bar";
import {
  Badge,
  Button,
  DataTable,
  Dialog,
  Input,
  Select,
  StatCard,
  type Column,
} from "@/components/ui";
import { useEmailMeta, useEmails } from "@/lib/api/hooks/use-messages";
import type { EmailMessage } from "@/lib/types";
import { formatDateTime } from "@/lib/utils/format";

/**
 * Transactional e-mail log (`/v1/emails`) - what the platform actually sent
 * (account created, password reset) and whether delivery failed.
 */
export default function EmailsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [template, setTemplate] = useState("");
  const [selected, setSelected] = useState<EmailMessage | null>(null);

  const { data, isLoading } = useEmails({
    search,
    status: status || undefined,
    template: template || undefined,
  });
  const { data: meta } = useEmailMeta();

  const emails = data ?? [];
  const failed = emails.filter((e) => e.status === "error").length;

  const statusOptions = [
    { value: "", label: "Wszystkie statusy" },
    ...(meta?.statuses ?? []).map((s) => ({ value: s.name, label: s.displayName || s.name })),
  ];
  const templateOptions = [
    { value: "", label: "Wszystkie szablony" },
    ...(meta?.templates ?? []).map((t) => ({ value: t.name, label: t.displayName || t.name })),
  ];

  const columns: Column<EmailMessage>[] = [
    {
      key: "subject",
      header: "Wiadomość",
      cell: (e) => (
        <div>
          <p className="font-medium">{e.subject}</p>
          <p className="text-xs text-muted-foreground">{e.toEmail}</p>
        </div>
      ),
    },
    { key: "template", header: "Szablon", align: "center", cell: (e) => <Badge variant="outline">{e.templateLabel}</Badge> },
    {
      key: "status",
      header: "Status",
      cell: (e) =>
        e.status === "error" ? (
          <Badge variant="danger" dot>{e.statusLabel}</Badge>
        ) : (
          <Badge variant="success" dot>{e.statusLabel}</Badge>
        ),
    },
    {
      key: "created",
      header: "Wysłano",
      align: "right",
      cell: (e) => <span className="text-sm text-muted-foreground">{formatDateTime(e.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <PageHeader
        title="Wiadomości e-mail"
        description="Dziennik wiadomości transakcyjnych wysłanych przez platformę."
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
        <StatCard label="Wiadomości" value={emails.length} icon={Mail} />
        <StatCard label="Wysłane" value={emails.length - failed} tone="success" />
        <StatCard label="Błędy" value={failed} tone={failed ? "danger" : "default"} />
      </div>

      <FilterBar>
        <div className="min-w-0 flex-1 sm:min-w-56">
          <Input
            icon={<Search />}
            placeholder="Szukaj tematu lub adresu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <Select options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 w-full sm:w-44" />
        <Select
          options={templateOptions}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="h-9 w-full sm:w-52"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={emails}
        rowKey={(e) => e.id}
        loading={isLoading}
        onRowClick={(e) => setSelected(e)}
        emptyTitle="Brak wiadomości"
        pageSize={15}
      />

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.subject}
        description={selected ? `${selected.toEmail} · ${formatDateTime(selected.createdAt)}` : undefined}
        className="max-w-3xl"
        footer={
          <Button variant="ghost" onClick={() => setSelected(null)}>
            Zamknij
          </Button>
        }
      >
        {selected && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{selected.templateLabel}</Badge>
              <Badge variant={selected.status === "error" ? "danger" : "success"}>{selected.statusLabel}</Badge>
            </div>
            {/* The stored body is HTML built from the template. */}
            <div
              className="max-h-[60vh] overflow-auto rounded-xl border border-border bg-muted/30 p-4 text-sm"
              dangerouslySetInnerHTML={{ __html: selected.body }}
            />
          </div>
        )}
      </Dialog>
    </div>
  );
}
