"use client";

import { useState } from "react";
import { Button, Dialog, Field, Input, Select } from "@/components/ui";
import { useAddManualMeasurement } from "@/lib/api/hooks/use-fill";
import { useContainers } from "@/lib/api/hooks/use-infrastructure";

/**
 * Manual fill entry (POST /v1/fill/manual-measurement) — how Access-only
 * altankas (no sensor) get a level, and how a bad auto reading is corrected.
 */
export function MeasurementDialog({
  open,
  onClose,
  containerCode,
}: {
  open: boolean;
  onClose: () => void;
  /** Pre-selected container; when omitted the user picks one. */
  containerCode?: string;
}) {
  const add = useAddManualMeasurement();
  const { data: containers } = useContainers();

  const [code, setCode] = useState(containerCode ?? "");
  const [value, setValue] = useState("");
  const [measuredAt, setMeasuredAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (!code) return setError("Wybierz pojemnik.");
    const level = Number(value);
    if (!value.trim() || Number.isNaN(level) || level < 0 || level > 100)
      return setError("Podaj zapełnienie jako liczbę 0–100 (%).");

    add.mutate(
      {
        containerCode: code,
        value: level,
        measuredAt: measuredAt ? new Date(measuredAt).toISOString() : null,
      },
      {
        onSuccess: () => {
          setValue("");
          setMeasuredAt("");
          onClose();
        },
        onError: () => setError("Nie udało się zapisać pomiaru."),
      },
    );
  }

  const options = [
    { value: "", label: "— wybierz pojemnik —" },
    ...(containers ?? []).map((c) => ({ value: c.code, label: c.code })),
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Dodaj pomiar zapełnienia"
      description="Ręczny odczyt trafia do telemetrii jako źródło „manualne”."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={submit} loading={add.isPending}>
            Zapisz pomiar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {containerCode ? (
          <Field label="Pojemnik">
            {({ id }) => <Input id={id} value={containerCode} disabled />}
          </Field>
        ) : (
          <Field label="Pojemnik" required>
            {({ id }) => (
              <Select id={id} options={options} value={code} onChange={(e) => setCode(e.target.value)} />
            )}
          </Field>
        )}
        <Field label="Zapełnienie (%)" required>
          {({ id }) => (
            <Input
              id={id}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode="numeric"
              placeholder="np. 65"
            />
          )}
        </Field>
        <Field label="Czas pomiaru" hint="Puste = teraz.">
          {({ id }) => (
            <Input
              id={id}
              type="datetime-local"
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
            />
          )}
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Dialog>
  );
}
