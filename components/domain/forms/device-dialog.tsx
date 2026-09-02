"use client";

import { useState } from "react";
import { Button, Dialog, Field, Input, Select } from "@/components/ui";
import { useAssignDevice, useRenameDevice } from "@/lib/api/hooks/use-devices";
import { useContainers, useStations } from "@/lib/api/hooks/use-infrastructure";
import type { Device } from "@/lib/types";

/**
 * Name an OT device and bind it to an altanka/container
 * (PUT /v1/devices/{id}/name, PUT /v1/devices/{id}/assignment).
 *
 * The assignment is what lets sessions, measurements and snapshots resolve a
 * station — an unassigned device shows up in the UI as a bare device key.
 */
export function DeviceDialog({
  open,
  onClose,
  device,
}: {
  open: boolean;
  onClose: () => void;
  device: Device;
}) {
  const rename = useRenameDevice();
  const assign = useAssignDevice();
  const { data: stations } = useStations();
  const { data: containers } = useContainers();

  const [name, setName] = useState(device.name);
  const [stationCode, setStationCode] = useState(device.stationCode ?? "");
  const [containerCode, setContainerCode] = useState(device.containerCode ?? "");
  const [error, setError] = useState<string | null>(null);

  const stationId = (stations ?? []).find((s) => s.code === stationCode)?.id;
  const containerOptions = [
    { value: "", label: "— bez pojemnika —" },
    ...(containers ?? [])
      // Only containers of the chosen altanka can sensibly be measured by it.
      .filter((c) => !stationId || c.stationId === stationId)
      .map((c) => ({ value: c.code, label: c.code })),
  ];
  const stationOptions = [
    { value: "", label: "— bez altanki —" },
    ...(stations ?? []).map((s) => ({ value: s.code, label: `${s.code} · ${s.name}` })),
  ];

  const pending = rename.isPending || assign.isPending;

  async function submit() {
    setError(null);
    try {
      if (name.trim() !== device.name) await rename.mutateAsync({ id: device.id, name });
      if (stationCode !== (device.stationCode ?? "") || containerCode !== (device.containerCode ?? "")) {
        await assign.mutateAsync({
          deviceId: device.id,
          stationCode: stationCode || null,
          containerCode: containerCode || null,
        });
      }
      onClose();
    } catch {
      setError("Nie udało się zapisać zmian urządzenia.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Urządzenie OT"
      description={`${device.deviceKey}${device.ip ? ` · ${device.ip}` : ""}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={submit} loading={pending}>
            Zapisz
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nazwa" hint="Czytelna etykieta zamiast klucza urządzenia.">
          {({ id }) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label="Altanka" hint="Bez przypisania sesje i pomiary nie mają kontekstu altanki.">
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
        <Field label="Pojemnik" hint="Dla czujników zapełnienia — wskazuje mierzony pojemnik.">
          {({ id }) => (
            <Select
              id={id}
              options={containerOptions}
              value={containerCode}
              onChange={(e) => setContainerCode(e.target.value)}
            />
          )}
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Dialog>
  );
}
