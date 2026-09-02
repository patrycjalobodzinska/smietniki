"use client";

import { useState } from "react";
import { Button, Dialog, Field, Input } from "@/components/ui";
import { useCreateVehicle } from "@/lib/api/hooks/use-operations";

/** Add a collection vehicle (POST /v1/vehicles). */
export function VehicleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateVehicle();

  const [code, setCode] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (!code.trim()) return setError("Podaj oznaczenie pojazdu (np. numer rejestracyjny).");
    const cap = capacity.trim() === "" ? undefined : Number(capacity);
    if (cap !== undefined && Number.isNaN(cap)) return setError("Pojemność nominalna musi być liczbą.");

    create.mutate(
      { code, operatorName, nominalCapacityUnits: cap },
      {
        onSuccess: () => {
          setCode("");
          setOperatorName("");
          setCapacity("");
          onClose();
        },
        onError: () => setError("Nie udało się dodać pojazdu."),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Dodaj pojazd"
      description="Śmieciarka lub inny pojazd realizujący odbiory."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={submit} loading={create.isPending}>
            Dodaj pojazd
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Oznaczenie" required>
          {({ id }) => <Input id={id} value={code} onChange={(e) => setCode(e.target.value)} placeholder="np. RZ-1042" />}
        </Field>
        <Field label="Operator">
          {({ id }) => <Input id={id} value={operatorName} onChange={(e) => setOperatorName(e.target.value)} />}
        </Field>
        <Field label="Pojemność nominalna" hint="W jednostkach używanych przez system (np. kg).">
          {({ id }) => (
            <Input id={id} value={capacity} onChange={(e) => setCapacity(e.target.value)} inputMode="numeric" />
          )}
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Dialog>
  );
}
