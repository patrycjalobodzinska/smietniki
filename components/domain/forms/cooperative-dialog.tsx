"use client";

import { useState } from "react";
import { Button, Dialog, Field, Input } from "@/components/ui";
import { useSaveCooperative } from "@/lib/api/hooks/use-infrastructure";
import type { Cooperative } from "@/lib/types";

/** Create / edit a cooperative (POST /v1/cooperatives, PUT /v1/cooperatives/{id}). */
export function CooperativeDialog({
  open,
  onClose,
  cooperative,
}: {
  open: boolean;
  onClose: () => void;
  cooperative?: Cooperative;
}) {
  const editing = !!cooperative;
  const save = useSaveCooperative();

  const [name, setName] = useState(cooperative?.name ?? "");
  const [district, setDistrict] = useState(cooperative?.district ?? "");
  const [contactPerson, setContactPerson] = useState(cooperative?.contactPerson ?? "");
  const [email, setEmail] = useState(cooperative?.email ?? "");
  const [phone, setPhone] = useState(cooperative?.phone ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (!name.trim()) return setError("Podaj nazwę spółdzielni / zarządcy.");
    save.mutate(
      { id: cooperative?.id, input: { name, district, contactPerson, email, phone } },
      { onSuccess: onClose, onError: () => setError("Nie udało się zapisać spółdzielni.") },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edytuj spółdzielnię" : "Dodaj spółdzielnię"}
      description="Podmiot odpowiedzialny za osiedlową infrastrukturę odpadową."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={submit} loading={save.isPending}>
            {editing ? "Zapisz zmiany" : "Dodaj"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nazwa" required className="sm:col-span-2">
          {({ id }) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label="Dzielnica">
          {({ id }) => <Input id={id} value={district} onChange={(e) => setDistrict(e.target.value)} />}
        </Field>
        <Field label="Osoba kontaktowa">
          {({ id }) => (
            <Input id={id} value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
          )}
        </Field>
        <Field label="Email">
          {({ id }) => <Input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
        </Field>
        <Field label="Telefon">
          {({ id }) => <Input id={id} value={phone} onChange={(e) => setPhone(e.target.value)} />}
        </Field>
        {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
      </div>
    </Dialog>
  );
}
