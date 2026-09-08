"use client";

import { useState } from "react";
import { Button, Dialog, Field, Input } from "@/components/ui";
import { authService } from "@/lib/api/services/auth";

/**
 * Krok pierwszy odzyskiwania hasła: POST /v1/account/request-password-reset
 * wysyła na adres wiadomość z linkiem.
 *
 * Krok drugi (POST /v1/account/reset-password) obsługuje osobny ekran
 * `/reset-hasla`, bo link z wiadomości niesie `userId` i `token` w query -
 * przepisywanie ich ręcznie do modala było zbędne.
 */
export function PasswordResetDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function close() {
    setError(null);
    setSent(false);
    onClose();
  }

  async function requestReset() {
    setError(null);
    if (!email.trim()) return setError("Podaj adres e-mail konta.");
    setBusy(true);
    try {
      await authService.requestPasswordReset(email);
      setSent(true);
    } catch {
      setError("Nie udało się wysłać wiadomości resetującej.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Reset hasła"
      description={
        sent
          ? undefined
          : "Wyślemy na podany adres wiadomość z linkiem do ustawienia nowego hasła."
      }
      footer={
        sent ? (
          <Button onClick={close}>Zamknij</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={close}>
              Anuluj
            </Button>
            <Button onClick={requestReset} loading={busy}>
              Wyślij link
            </Button>
          </>
        )
      }
    >
      {sent ? (
        <p className="text-sm text-muted-foreground">
          Jeśli konto o adresie <span className="font-medium text-foreground">{email}</span> istnieje,
          wiadomość z linkiem jest już w drodze. Link prowadzi do ekranu ustawienia nowego hasła
          i wygasa po pewnym czasie.
        </p>
      ) : (
        <div className="space-y-3">
          <Field label="Adres e-mail" required>
            {({ id }) => (
              <Input
                id={id}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            )}
          </Field>
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      )}
    </Dialog>
  );
}
