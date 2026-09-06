"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button, Input, Field } from "@/components/ui";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordResetDialog } from "@/components/auth/password-reset-dialog";
import { REAL } from "@/lib/api/config";
import { authService } from "@/lib/api/services/auth";
import { extractUnlock, setFullMode } from "@/lib/full-mode";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(REAL ? "admin@SprigaAPI.com" : "admin@smartwaste.pl");
  const [password, setPassword] = useState(REAL ? "!23Haslo" : "demo1234");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    // A secret code appended to the password unlocks the hidden full panel.
    const { password: realPassword, unlock } = extractUnlock(password);
    setLoading(true);
    try {
      await authService.signIn(email, realPassword);
      setFullMode(unlock);
      router.push(unlock ? "/features" : "/");
    } catch {
      setError("Nieprawidłowy email lub hasło.");
      setLoading(false);
    }
  }

  return (
    <AuthShell heading="Zaloguj się">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Email">
          {({ id }) => (
            <Input
              id={id}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          )}
        </Field>
        <Field label="Hasło">
          {({ id }) => (
            <div className="relative">
              <Input
                id={id}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          )}
        </Field>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Logowanie…" : "Zaloguj"}
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setResetOpen(true)}
          className="font-medium text-primary hover:underline"
        >
          Nie pamiętam hasła
        </button>
        <Link href="/rejestracja" className="font-medium text-primary hover:underline">
          Utwórz konto
        </Link>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        {REAL
          ? "Połączono z SprigaAPI - dane logowania pre-wypełnione"
          : "Wersja demonstracyjna - dane pre-wypełnione"}
      </p>

      <PasswordResetDialog open={resetOpen} onClose={() => setResetOpen(false)} />
    </AuthShell>
  );
}
