"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  Field,
  Input,
  Select,
  Switch,
} from "@/components/ui";
import { useCooperatives, useSaveStation } from "@/lib/api/hooks/use-infrastructure";
import { useFullMode } from "@/lib/full-mode";
import type { AccessMode, BinStation, DeploymentVariant, StationStatus } from "@/lib/types";
import { STATION_STATUS_LABEL, VARIANT_LABEL } from "@/lib/labels";

/**
 * Create / edit an altanka (POST /v1/bin-stations, PUT /v1/bin-stations/{id}).
 *
 * `code` and the owning cooperative are set at creation only — the update
 * command carries neither — while `status` exists only on update.
 */

const VARIANT_OPTIONS = (Object.keys(VARIANT_LABEL) as DeploymentVariant[]).map((v) => ({
  value: v,
  label: VARIANT_LABEL[v],
}));

const ACCESS_MODE_OPTIONS: { value: AccessMode; label: string }[] = [
  { value: "rfid", label: "RFID" },
  { value: "physical", label: "Klucz fizyczny" },
  { value: "mobile", label: "Klucz mobilny" },
  { value: "mixed", label: "Mieszany" },
];

const STATUS_OPTIONS = (Object.keys(STATION_STATUS_LABEL) as StationStatus[]).map((s) => ({
  value: s,
  label: STATION_STATUS_LABEL[s],
}));

/** Cooperative picker — mounted only in full mode, so KM1 never calls the endpoint. */
function CooperativeField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { data: coops, isLoading } = useCooperatives();
  const options = [
    { value: "", label: isLoading ? "Ładowanie spółdzielni…" : "— bez spółdzielni —" },
    ...(coops ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];
  return (
    <Field label="Spółdzielnia" className="sm:col-span-2">
      {({ id }) => (
        <Select id={id} options={options} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

export function StationDialog({
  open,
  onClose,
  station,
}: {
  open: boolean;
  onClose: () => void;
  /** Omit to create a new altanka. */
  station?: BinStation;
}) {
  const editing = !!station;
  const fullMode = useFullMode();
  const save = useSaveStation();

  const [code, setCode] = useState(station?.code ?? "");
  const [name, setName] = useState(station?.name ?? "");
  const [address, setAddress] = useState(station?.address ?? "");
  const [district, setDistrict] = useState(station?.district ?? "");
  const [cooperativeId, setCooperativeId] = useState(station?.cooperativeId ?? "");
  const [lat, setLat] = useState(station ? String(station.location.lat) : "");
  const [lng, setLng] = useState(station ? String(station.location.lng) : "");
  const [variant, setVariant] = useState<DeploymentVariant>(station?.deploymentVariant ?? "access");
  const [accessMode, setAccessMode] = useState<AccessMode>(station?.accessMode ?? "rfid");
  const [hasCamera, setHasCamera] = useState(station?.hasCamera ?? false);
  const [status, setStatus] = useState<StationStatus>(station?.status ?? "active");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (!editing && !code.trim()) return setError("Podaj kod altanki (np. ALT-014).");
    if (!name.trim()) return setError("Podaj nazwę altanki.");
    const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));
    if ((lat && Number.isNaN(num(lat))) || (lng && Number.isNaN(num(lng))))
      return setError("Współrzędne muszą być liczbami.");

    save.mutate(
      {
        id: station?.id,
        input: {
          code: code || station?.code || "",
          name,
          address,
          district,
          cooperativeId: cooperativeId || null,
          lat: num(lat),
          lng: num(lng),
          deploymentVariant: variant,
          accessMode,
          hasCamera,
          status,
        },
      },
      {
        onSuccess: onClose,
        onError: () => setError("Nie udało się zapisać altanki. Sprawdź dane i spróbuj ponownie."),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edytuj altankę" : "Dodaj altankę"}
      description={
        editing
          ? "Kod i przypisanie do spółdzielni są ustalane przy tworzeniu i nie podlegają edycji."
          : "Nowa altanka śmietnikowa wraz z poziomem cyfryzacji."
      }
      className="max-w-2xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={submit} loading={save.isPending}>
            {editing ? "Zapisz zmiany" : "Dodaj altankę"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {!editing && (
          <Field label="Kod" required hint="Unikalny identyfikator, np. ALT-014.">
            {({ id }) => (
              <Input id={id} value={code} onChange={(e) => setCode(e.target.value)} placeholder="ALT-014" />
            )}
          </Field>
        )}
        <Field label="Nazwa" required className={editing ? "sm:col-span-2" : undefined}>
          {({ id }) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label="Adres">
          {({ id }) => <Input id={id} value={address} onChange={(e) => setAddress(e.target.value)} />}
        </Field>
        <Field label="Dzielnica">
          {({ id }) => <Input id={id} value={district} onChange={(e) => setDistrict(e.target.value)} />}
        </Field>
        {/* The cooperative layer is out of KM1 — only the full mode assigns one. */}
        {!editing && fullMode && (
          <CooperativeField value={cooperativeId} onChange={setCooperativeId} />
        )}
        <Field label="Szerokość geogr.">
          {({ id }) => <Input id={id} value={lat} onChange={(e) => setLat(e.target.value)} placeholder="50.0413" />}
        </Field>
        <Field label="Długość geogr.">
          {({ id }) => <Input id={id} value={lng} onChange={(e) => setLng(e.target.value)} placeholder="21.9990" />}
        </Field>
        <Field label="Wariant wdrożenia" required>
          {({ id }) => (
            <Select
              id={id}
              options={VARIANT_OPTIONS}
              value={variant}
              onChange={(e) => setVariant(e.target.value as DeploymentVariant)}
            />
          )}
        </Field>
        <Field label="Sposób otwierania" required>
          {({ id }) => (
            <Select
              id={id}
              options={ACCESS_MODE_OPTIONS}
              value={accessMode}
              onChange={(e) => setAccessMode(e.target.value as AccessMode)}
            />
          )}
        </Field>
        {editing && (
          <Field label="Status">
            {({ id }) => (
              <Select
                id={id}
                options={STATUS_OPTIONS}
                value={status}
                onChange={(e) => setStatus(e.target.value as StationStatus)}
              />
            )}
          </Field>
        )}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border px-3.5 py-2.5 sm:col-span-2">
          <div>
            <p className="text-sm font-medium">Monitoring wideo</p>
            <p className="text-xs text-muted-foreground">Altanka ma kamerę (wariant Vision).</p>
          </div>
          <Switch checked={hasCamera} onCheckedChange={setHasCamera} />
        </div>
        {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
      </div>
    </Dialog>
  );
}
