"use client";

import { useState } from "react";
import { Button, Dialog, Field, Input } from "@/components/ui";
import { authService } from "@/lib/api/services/auth";

/**
 * Password recovery in two steps, matching the API:
 * 1. POST /v1/account/request-password-reset - mails a token,
 * 2. POST /v1/account/reset-password - token + userId + new password.
 *
 * The token and user id arrive in the message, so step 2 asks for both.
 */
export function PasswordResetDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function close() {
    setStep(1);
    setError(null);
    setOk(null);
    setToken("");
    setPassword("");
    setConfirm("");
    onClose();
  }

  async function requestToken() {
    setError(null);
    setOk(null);
    if (!email.trim()) return setError("Podaj adres e-mail konta.");
    setBusy(true);
    try {
      await authService.requestPasswordReset(email);
      setOk("Wysłaliśmy wiadomość z tokenem resetu. Wklej dane z wiadomości poniżej.");
      setStep(2);
    } catch {
      setError("Nie udało się wysłać wiadomości resetującej.");
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    setError(null);
    setOk(null);
    if (!userId.trim() || !token.trim()) return setError("Podaj identyfikator użytkownika i token z wiadomości.");
    if (!password) return setError("Podaj nowe hasło.");
    if (password !== confirm) return setError("Hasła nie są identyczne.");
    setBusy(true);
    try {
      await authService.resetPassword({ userId, token, password, confirmPassword: confirm });
      setOk("Hasło zostało ustawione. Możesz się zalogować.");
    } catch {
      setError("Nie udało się ustawić hasła - token mógł wygasnąć.");
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
        step === 1
          ? "Wyślemy na podany adres wiadomość z tokenem resetu."
          : "Wklej dane z wiadomości i ustaw nowe hasło."
      }
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Zamknij
          </Button>
          {step === 1 ? (
            <Button onClick={requestToken} loading={busy}>
              Wyślij token
            </Button>
          ) : (
            <Button onClick={reset} loading={busy}>
              Ustaw hasło
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Email">
          {({ id }) => (
            <Input
              id={id}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={step === 2}
            />
          )}
        </Field>
        {step === 2 && (
          <>
            <Field label="Identyfikator użytkownika" hint="Z wiadomości e-mail (userId).">
              {({ id }) => <Input id={id} value={userId} onChange={(e) => setUserId(e.target.value)} />}
            </Field>
            <Field label="Token">
              {({ id }) => <Input id={id} value={token} onChange={(e) => setToken(e.target.value)} />}
            </Field>
            <Field label="Nowe hasło">
              {({ id }) => (
                <Input id={id} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              )}
            </Field>
            <Field label="Powtórz hasło">
              {({ id }) => (
                <Input id={id} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              )}
            </Field>
          </>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        {ok && <p className="text-sm text-success">{ok}</p>}
      </div>
    </Dialog>
  );
}
