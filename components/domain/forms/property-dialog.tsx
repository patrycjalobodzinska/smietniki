"use client";

import { useState } from "react";
import { Button, Dialog, Field, Input, Select } from "@/components/ui";
import { useCooperatives, useSaveProperty, useStations } from "@/lib/api/hooks/use-infrastructure";
import type { BuildingType, Property } from "@/lib/types";
import { BUILDING_LABEL } from "@/lib/labels";

/** Create / edit a property (POST /v1/properties, PUT /v1/properties/{id}). */

const BUILDING_OPTIONS = (Object.keys(BUILDING_LABEL) as BuildingType[]).map((b) => ({
  value: b,
  label: BUILDING_LABEL[b],
}));

export function PropertyDialog({
  open,
  onClose,
  property,
  cooperativeId,
}: {
  open: boolean;
  onClose: () => void;
  property?: Property;
  /** Pre-selected cooperative when adding from its detail page. */
  cooperativeId?: string;
}) {
  const editing = !!property;
  const save = useSaveProperty();
  const { data: coops } = useCooperatives();
  const { data: stations } = useStations();

  const [coop, setCoop] = useState(property?.cooperativeId ?? cooperativeId ?? "");
  const [address, setAddress] = useState(property?.address ?? "");
  const [district, setDistrict] = useState(property?.district ?? "");
  const [buildingType, setBuildingType] = useState<BuildingType>(property?.buildingType ?? "block");
  const [unitsCount, setUnitsCount] = useState(property ? String(property.unitsCount) : "");
  const [residentsCount, setResidentsCount] = useState(property ? String(property.residentsCount) : "");
  const [stationId, setStationId] = useState(property?.assignedStationId ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (!editing && !coop) return setError("Wybierz spółdzielnię.");
    if (!address.trim()) return setError("Podaj adres nieruchomości.");
    const num = (v: string) => (v.trim() === "" ? undefined : Number(v));
    if ([unitsCount, residentsCount].some((v) => v.trim() !== "" && Number.isNaN(Number(v))))
      return setError("Liczba lokali i mieszkańców musi być liczbą.");

    save.mutate(
      {
        id: property?.id,
        input: {
          cooperativeId: coop || property?.cooperativeId || "",
          address,
          district,
          buildingType,
          unitsCount: num(unitsCount),
          residentsCount: num(residentsCount),
          assignedStationId: stationId || null,
        },
      },
      { onSuccess: onClose, onError: () => setError("Nie udało się zapisać nieruchomości.") },
    );
  }

  const coopOptions = [
    { value: "", label: "— wybierz spółdzielnię —" },
    ...(coops ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];
  const stationOptions = [
    { value: "", label: "— bez altanki —" },
    ...(stations ?? []).map((s) => ({ value: s.id, label: `${s.code} · ${s.name}` })),
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edytuj nieruchomość" : "Dodaj nieruchomość"}
      description="Budynek z lokalami, mieszkańcami i przypisaną altanką."
      className="max-w-2xl"
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
        {!editing && (
          <Field label="Spółdzielnia" required className="sm:col-span-2">
            {({ id }) => (
              <Select id={id} options={coopOptions} value={coop} onChange={(e) => setCoop(e.target.value)} />
            )}
          </Field>
        )}
        <Field label="Adres" required className="sm:col-span-2">
          {({ id }) => <Input id={id} value={address} onChange={(e) => setAddress(e.target.value)} />}
        </Field>
        <Field label="Dzielnica">
          {({ id }) => <Input id={id} value={district} onChange={(e) => setDistrict(e.target.value)} />}
        </Field>
        <Field label="Typ budynku">
          {({ id }) => (
            <Select
              id={id}
              options={BUILDING_OPTIONS}
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value as BuildingType)}
            />
          )}
        </Field>
        <Field label="Liczba lokali">
          {({ id }) => (
            <Input id={id} value={unitsCount} onChange={(e) => setUnitsCount(e.target.value)} inputMode="numeric" />
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
        <Field label="Przypisana altanka" className="sm:col-span-2">
          {({ id }) => (
            <Select
              id={id}
              options={stationOptions}
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
            />
          )}
        </Field>
        {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
      </div>
    </Dialog>
  );
}
