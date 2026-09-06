"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Field, Input } from "@/components/ui";
import { AuthShell } from "@/components/auth/auth-shell";
import { authService } from "@/lib/api/services/auth";

/**
 * Self-service registration (POST /v1/account/sign-up). The account needs its
 * e-mail confirmed before it can sign in, so we offer to (re)send the message
 * and link to the confirmation screen.
 */
export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (!email.trim() || !password) return setError("Podaj adres e-mail i hasło.");
    if (password !== confirm) return setError("Hasła nie są identyczne.");
    setBusy(true);
    try {
      const res = await authService.signUp(email, password, confirm);
      setUserId(res.userId);
      setOk("Konto utworzone. Sprawdź skrzynkę i potwierdź adres e-mail.");
    } catch {
      setError("Nie udało się utworzyć konta - adres może być już zajęty.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (!userId) return;
    setError(null);
    setBusy(true);
    try {
      await authService.sendConfirmationEmail(userId);
      setOk("Wiadomość potwierdzająca została wysłana ponownie.");
    } catch {
      setError("Nie udało się wysłać wiadomości potwierdzającej.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell heading="Utwórz konto">
      <form className="space-y-4" onSubmit={submit}>
        <Field label="Email" required>
          {({ id }) => (
            <Input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          )}
        </Field>
        <Field label="Hasło" required>
          {({ id }) => (
            <Input
              id={id}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          )}
        </Field>
        <Field label="Powtórz hasło" required>
          {({ id }) => (
            <Input
              id={id}
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          )}
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
        {ok && <p className="text-sm text-success">{ok}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          {busy ? "Tworzenie…" : "Utwórz konto"}
        </Button>
      </form>

      {userId && (
        <div className="mt-4 space-y-2 rounded-xl bg-info/10 p-3 text-xs text-muted-foreground">
          <p>
            Identyfikator konta: <span className="text-foreground">{userId}</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={resend} className="font-medium text-primary hover:underline">
              Wyślij ponownie e-mail
            </button>
            <Link
              href={`/potwierdzenie?userId=${encodeURIComponent(userId)}`}
              className="font-medium text-primary hover:underline"
            >
              Mam token - potwierdź adres
            </Link>
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-xs">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Wróć do logowania
        </Link>
      </p>
    </AuthShell>
  );
}
