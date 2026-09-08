"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button, Field, Input, Spinner } from "@/components/ui";
import { AuthShell } from "@/components/auth/auth-shell";
import { authService } from "@/lib/api/services/auth";

/**
 * Ustawienie nowego hasła (POST /v1/account/reset-password). Link z wiadomości
 * niesie `userId` i `token` w query - wtedy użytkownik podaje tylko hasło.
 * Oba pola da się też wkleić ręcznie, gdy klient pocztowy uciął odnośnik.
 */

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();

  const urlUserId = params.get("userId") ?? "";
  const urlToken = params.get("token") ?? "";
  const fromLink = !!urlUserId && !!urlToken;

  const [userId, setUserId] = useState(urlUserId);
  const [token, setToken] = useState(urlToken);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!userId.trim() || !token.trim())
      return setError("Brak danych z wiadomości - otwórz link z e-maila albo wklej identyfikator i token.");
    if (password.length < 8) return setError("Hasło musi mieć co najmniej 8 znaków.");
    if (password !== confirm) return setError("Hasła nie są identyczne.");

    setBusy(true);
    try {
      await authService.resetPassword({ userId, token, password, confirmPassword: confirm });
      setDone(true);
    } catch {
      setError("Nie udało się ustawić hasła - token mógł wygasnąć lub został już użyty.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <AuthShell heading="Hasło ustawione">
        <div className="space-y-4">
          <p className="text-sm text-success">
            Nowe hasło zostało zapisane. Możesz zalogować się na swoje konto.
          </p>
          <Button className="w-full" size="lg" onClick={() => router.push("/login")}>
            Przejdź do logowania
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      heading="Ustaw nowe hasło"
      subtitle={
        fromLink
          ? "Link z wiadomości jest poprawny. Podaj nowe hasło do konta."
          : "Wklej identyfikator konta i token z wiadomości, a potem ustaw hasło."
      }
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Wróć do logowania
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {/* Dane z linku pokazujemy tylko wtedy, gdy trzeba je uzupełnić ręcznie. */}
        {!fromLink && (
          <>
            <Field label="Identyfikator konta" required hint="Wartość userId z wiadomości e-mail.">
              {({ id }) => <Input id={id} value={userId} onChange={(e) => setUserId(e.target.value)} />}
            </Field>
            <Field label="Token" required>
              {({ id }) => <Input id={id} value={token} onChange={(e) => setToken(e.target.value)} />}
            </Field>
          </>
        )}

        <Field label="Nowe hasło" required hint="Co najmniej 8 znaków.">
          {({ id }) => (
            <div className="relative">
              <Input
                id={id}
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Ukryj hasło" : "Pokaż hasło"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          )}
        </Field>

        <Field label="Powtórz hasło" required>
          {({ id }) => (
            <Input
              id={id}
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          )}
        </Field>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" className="w-full" size="lg" loading={busy}>
          Ustaw hasło
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <ResetForm />
    </Suspense>
  );
}
