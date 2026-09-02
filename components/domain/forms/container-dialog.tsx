"use client";

import { useState } from "react";
import { Button, Dialog, Field, Input, Select } from "@/components/ui";
import { useSaveContainer, useStations } from "@/lib/api/hooks/use-infrastructure";
import type { Container, DataSource, WasteFraction } from "@/lib/types";
import { DATA_SOURCE_LABEL, FRACTION_LABEL } from "@/lib/labels";

/**
 * Create / edit a container (POST /v1/containers, PUT /v1/containers/{id}).
 * Code and altanka are fixed at creation; the update command adds sensorStatus.
 */

const FRACTION_OPTIONS = (Object.keys(FRACTION_LABEL) as WasteFraction[])
  // The API knows 5 fractions — "other" would silently become Mixed.
  .filter((f) => f !== "other")
  .map((f) => ({ value: f, label: FRACTION_LABEL[f] }));

const SOURCE_OPTIONS = (Object.keys(DATA_SOURCE_LABEL) as DataSource[]).map((s) => ({
  value: s,
  label: DATA_SOURCE_LABEL[s],
}));

export function ContainerDialog({
  open,
  onClose,
  container,
  stationId,
}: {
  open: boolean;
  onClose: () => void;
  /** Omit to create. */
  container?: Container;
  /** Pre-selected altanka when adding from a station detail page. */
  stationId?: string;
}) {
  const editing = !!container;
  const save = useSaveContainer();
  const { data: stations } = useStations();

  const [code, setCode] = useState(container?.code ?? "");
  const [station, setStation] = useState(container?.stationId ?? stationId ?? "");
  const [fraction, setFraction] = useState<WasteFraction>(container?.fraction ?? "mixed");
  const [capacity, setCapacity] = useState(container ? String(container.capacityL) : "1100");
  const [dataSource, setDataSource] = useState<DataSource>(container?.dataSource ?? "auto");
  const [sensorStatus, setSensorStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (!editing && !code.trim()) return setError("Podaj kod pojemnika (np. POJ-0142).");
    if (!editing && !station) return setError("Wybierz altankę, w której stoi pojemnik.");
    const cap = capacity.trim() === "" ? null : Number(capacity);
    if (cap !== null && (Number.isNaN(cap) || cap <= 0)) return setError("Pojemność musi być liczbą w litrach.");

    save.mutate(
      {
        id: container?.id,
        input: {
          code: code || container?.code || "",
          stationId: station || container?.stationId || "",
          fraction,
          capacityL: cap ?? undefined,
          dataSource,
          sensorStatus: editing ? sensorStatus : null,
        },
      },
      {
        onSuccess: onClose,
        onError: () => setError("Nie udało się zapisać pojemnika."),
      },
    );
  }

  const stationOptions = [
    { value: "", label: "— wybierz altankę —" },
    ...(stations ?? []).map((s) => ({ value: s.id, label: `${s.code} · ${s.name}` })),
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edytuj pojemnik" : "Dodaj pojemnik"}
      description={
        editing
          ? "Kod i altanka są ustalane przy tworzeniu pojemnika."
          : "Nowy pojemnik przypisany do altanki."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={submit} loading={save.isPending}>
            {editing ? "Zapisz zmiany" : "Dodaj pojemnik"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {!editing && (
          <>
            <Field label="Kod" required>
              {({ id }) => (
                <Input id={id} value={code} onChange={(e) => setCode(e.target.value)} placeholder="POJ-0142" />
              )}
            </Field>
            <Field label="Altanka" required>
              {({ id }) => (
                <Select
                  id={id}
                  options={stationOptions}
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                />
              )}
            </Field>
          </>
        )}
        <Field label="Frakcja" required>
          {({ id }) => (
            <Select
              id={id}
              options={FRACTION_OPTIONS}
              value={fraction}
              onChange={(e) => setFraction(e.target.value as WasteFraction)}
            />
          )}
        </Field>
        <Field label="Pojemność (l)">
          {({ id }) => (
            <Input id={id} value={capacity} onChange={(e) => setCapacity(e.target.value)} inputMode="numeric" />
          )}
        </Field>
        <Field label="Źródło danych o zapełnieniu" required hint="Auto = czujnik, Manualne = wpis operatora.">
          {({ id }) => (
            <Select
              id={id}
              options={SOURCE_OPTIONS}
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value as DataSource)}
            />
          )}
        </Field>
        {editing && (
          <Field label="Status czujnika" hint="Puste = bez zmian sygnalizowanych przez czujnik.">
            {({ id }) => (
              <Input
                id={id}
                value={sensorStatus}
                onChange={(e) => setSensorStatus(e.target.value)}
                placeholder="np. Ok / Error"
              />
            )}
          </Field>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Dialog>
  );
}
