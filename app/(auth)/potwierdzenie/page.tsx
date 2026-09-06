"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Field, Input, Spinner } from "@/components/ui";
import { AuthShell } from "@/components/auth/auth-shell";
import { authService } from "@/lib/api/services/auth";

/**
 * E-mail confirmation (POST /v1/account/confirm-email). The link from the
 * message carries `userId` and `token` in the query; both can also be pasted.
 */
function ConfirmForm() {
  const params = useSearchParams();
  const [userId, setUserId] = useState(params.get("userId") ?? "");
  const [token, setToken] = useState(params.get("token") ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function confirm() {
    setError(null);
    if (!userId.trim() || !token.trim()) return setError("Podaj identyfikator konta i token z wiadomości.");
    setBusy(true);
    try {
      await authService.confirmEmail(userId, token);
      setOk(true);
    } catch {
      setError("Nie udało się potwierdzić adresu - token mógł wygasnąć.");
    } finally {
      setBusy(false);
    }
  }

  // A link straight from the e-mail carries both values: confirm right away.
  useEffect(() => {
    if (!params.get("userId") || !params.get("token")) return;
    const t = setTimeout(confirm, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for the link case
  }, []);

  return (
    <AuthShell heading="Potwierdzenie adresu e-mail">
      {ok ? (
        <div className="space-y-4">
          <p className="text-sm text-success">Adres e-mail został potwierdzony.</p>
          <Link href="/login">
            <Button className="w-full" size="lg">
              Przejdź do logowania
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Identyfikator konta" required>
            {({ id }) => <Input id={id} value={userId} onChange={(e) => setUserId(e.target.value)} />}
          </Field>
          <Field label="Token" required>
            {({ id }) => <Input id={id} value={token} onChange={(e) => setToken(e.target.value)} />}
          </Field>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button className="w-full" size="lg" onClick={confirm} disabled={busy}>
            {busy ? "Potwierdzanie…" : "Potwierdź adres"}
          </Button>
          <p className="text-center text-xs">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Wróć do logowania
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <ConfirmForm />
    </Suspense>
  );
}
