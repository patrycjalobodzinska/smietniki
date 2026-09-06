"use client";

import { useState } from "react";
import { Button, Dialog, Field, Input, Textarea } from "@/components/ui";
import { useCreateUnit } from "@/lib/api/hooks/use-infrastructure";

/** Add a unit to a property (POST /v1/units). The API has no unit update. */
export function UnitDialog({
  open,
  onClose,
  propertyId,
}: {
  open: boolean;
  onClose: () => void;
  propertyId: string;
}) {
  const create = useCreateUnit();

  const [unitNumber, setUnitNumber] = useState("");
  const [residentsCount, setResidentsCount] = useState("");
  const [keysLimit, setKeysLimit] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (!unitNumber.trim()) return setError("Podaj numer lokalu.");
    const num = (v: string) => (v.trim() === "" ? undefined : Number(v));
    if ([residentsCount, keysLimit].some((v) => v.trim() !== "" && Number.isNaN(Number(v))))
      return setError("Liczba mieszkańców i limit kluczy muszą być liczbami.");

    create.mutate(
      {
        propertyId,
        unitNumber,
        residentsCount: num(residentsCount),
        keysLimit: num(keysLimit),
        notes,
      },
      {
        onSuccess: () => {
          setUnitNumber("");
          setResidentsCount("");
          setKeysLimit("");
          setNotes("");
          onClose();
        },
        onError: () => setError("Nie udało się dodać lokalu."),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Dodaj lokal"
      description="Lokal w tej nieruchomości - podstawa limitu kluczy dostępu."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={submit} loading={create.isPending}>
            Dodaj lokal
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Numer lokalu" required>
          {({ id }) => (
            <Input id={id} value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} placeholder="np. 14" />
          )}
        </Field>
        <Field label="Liczba mieszkańców">
          {({ id }) => (
            <Input
              id={id}
              value={residentsCount}
              onChange={(e) => setResidentsCount(e.target.value)}
              inputMode="numeric"
            />
          )}
        </Field>
        <Field label="Limit kluczy">
          {({ id }) => (
            <Input id={id} value={keysLimit} onChange={(e) => setKeysLimit(e.target.value)} inputMode="numeric" />
          )}
        </Field>
        <Field label="Notatka">
          {({ id }) => <Textarea id={id} value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />}
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Dialog>
  );
}
