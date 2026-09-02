"use client";

import { useState } from "react";
import { Button, Dialog, Field, Input, Select } from "@/components/ui";
import { usePlanRoute, useVehicles } from "@/lib/api/hooks/use-operations";

/**
 * Plan a route (POST /v1/routes). The API stores only a header — date,
 * operator, vehicle — so no stops are sent here.
 */
export function RouteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const plan = usePlanRoute();
  const { data: vehicles } = useVehicles();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [operatorName, setOperatorName] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (!date) return setError("Wybierz datę trasy.");
    plan.mutate(
      { date: new Date(date).toISOString(), operatorName, vehicleId: vehicleId || null },
      { onSuccess: onClose, onError: () => setError("Nie udało się zaplanować trasy.") },
    );
  }

  const vehicleOptions = [
    { value: "", label: "— bez pojazdu —" },
    ...(vehicles ?? []).map((v) => ({ value: v.id, label: `${v.code} · ${v.operator}` })),
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Zaplanuj trasę"
      description="API przechowuje nagłówek trasy (data, operator, pojazd) — punkty dodaje się przez odbiory."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={submit} loading={plan.isPending}>
            Zaplanuj
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Data" required>
          {({ id }) => <Input id={id} type="date" value={date} onChange={(e) => setDate(e.target.value)} />}
        </Field>
        <Field label="Operator">
          {({ id }) => (
            <Input id={id} value={operatorName} onChange={(e) => setOperatorName(e.target.value)} placeholder="np. PGK Rzeszów" />
          )}
        </Field>
        <Field label="Pojazd">
          {({ id }) => (
            <Select id={id} options={vehicleOptions} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} />
          )}
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Dialog>
  );
}
