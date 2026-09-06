"use client";

import { useState } from "react";
import { Button, Dialog, DatePicker, Field, Input, Select, Textarea } from "@/components/ui";
import { useRegisterCollection, useRoutes, useVehicles } from "@/lib/api/hooks/use-operations";
import { useContainers, useStations } from "@/lib/api/hooks/use-infrastructure";
import { formatDate } from "@/lib/utils/format";

/**
 * Register a completed pickup (POST /v1/collections). Levels before/after are
 * what makes the record "potwierdzony" rather than estimated.
 */
export function CollectionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const register = useRegisterCollection();
  const { data: stations } = useStations();
  const { data: containers } = useContainers();
  const { data: vehicles } = useVehicles();
  const { data: routes } = useRoutes();

  const [stationCode, setStationCode] = useState("");
  const [containerCode, setContainerCode] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [collectedAt, setCollectedAt] = useState("");
  const [levelBefore, setLevelBefore] = useState("");
  const [levelAfter, setLevelAfter] = useState("0");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const stationId = (stations ?? []).find((s) => s.code === stationCode)?.id;

  function submit() {
    setError(null);
    if (!stationCode) return setError("Wybierz altankę.");
    const level = (v: string) => (v.trim() === "" ? null : Number(v));
    const before = level(levelBefore);
    const after = level(levelAfter);
    if ([before, after].some((v) => v !== null && (Number.isNaN(v) || v < 0 || v > 100)))
      return setError("Poziomy zapełnienia podaj jako liczby 0–100 (%).");

    register.mutate(
      {
        stationCode,
        containerCode: containerCode || null,
        operatorName,
        vehicleId: vehicleId || null,
        routeId: routeId || null,
        collectedAt: collectedAt ? new Date(collectedAt).toISOString() : null,
        levelBefore: before,
        levelAfter: after,
        note,
      },
      { onSuccess: onClose, onError: () => setError("Nie udało się zarejestrować odbioru.") },
    );
  }

  const stationOptions = [
    { value: "", label: "- wybierz altankę -" },
    ...(stations ?? []).map((s) => ({ value: s.code, label: `${s.code} · ${s.name}` })),
  ];
  const containerOptions = [
    { value: "", label: "- cała altanka -" },
    ...(containers ?? [])
      .filter((c) => !stationId || c.stationId === stationId)
      .map((c) => ({ value: c.code, label: c.code })),
  ];
  const vehicleOptions = [
    { value: "", label: "- bez pojazdu -" },
    ...(vehicles ?? []).map((v) => ({ value: v.id, label: `${v.code} · ${v.operator}` })),
  ];
  const routeOptions = [
    { value: "", label: "- bez trasy -" },
    ...(routes ?? []).map((r) => ({ value: r.id, label: `${r.name} (${formatDate(r.date)})` })),
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Zarejestruj odbiór"
      description="Zapis wykonanego odbioru z poziomami przed i po opróżnieniu."
      className="max-w-2xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={submit} loading={register.isPending}>
            Zarejestruj
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Altanka" required>
          {({ id }) => (
            <Select
              id={id}
              options={stationOptions}
              value={stationCode}
              onChange={(e) => {
                setStationCode(e.target.value);
                setContainerCode("");
              }}
            />
          )}
        </Field>
        <Field label="Pojemnik">
          {({ id }) => (
            <Select
              id={id}
              options={containerOptions}
              value={containerCode}
              onChange={(e) => setContainerCode(e.target.value)}
            />
          )}
        </Field>
        <Field label="Operator">
          {({ id }) => (
            <Input id={id} value={operatorName} onChange={(e) => setOperatorName(e.target.value)} placeholder="np. PGK Rzeszów" />
          )}
        </Field>
        <Field label="Czas odbioru" hint="Puste = teraz.">
          {({ id }) => (
            <DatePicker id={id} withTime value={collectedAt} onChange={(e) => setCollectedAt(e.target.value)} />
          )}
        </Field>
        <Field label="Pojazd">
          {({ id }) => (
            <Select id={id} options={vehicleOptions} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} />
          )}
        </Field>
        <Field label="Trasa">
          {({ id }) => (
            <Select id={id} options={routeOptions} value={routeId} onChange={(e) => setRouteId(e.target.value)} />
          )}
        </Field>
        <Field label="Poziom przed (%)" hint="Wraz z poziomem po decyduje o statusie „potwierdzony”.">
          {({ id }) => (
            <Input id={id} value={levelBefore} onChange={(e) => setLevelBefore(e.target.value)} inputMode="numeric" />
          )}
        </Field>
        <Field label="Poziom po (%)">
          {({ id }) => (
            <Input id={id} value={levelAfter} onChange={(e) => setLevelAfter(e.target.value)} inputMode="numeric" />
          )}
        </Field>
        <Field label="Notatka" className="sm:col-span-2">
          {({ id }) => <Textarea id={id} value={note} onChange={(e) => setNote(e.target.value)} rows={2} />}
        </Field>
        {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
      </div>
    </Dialog>
  );
}
