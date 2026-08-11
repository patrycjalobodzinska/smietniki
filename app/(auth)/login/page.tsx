"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Eye, EyeOff } from "lucide-react";
import { Button, Input, Field } from "@/components/ui";
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Subtle technical grid + green glow (spec §17.1). */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black, transparent 75%)",
        }}
      />
      <div className="pointer-events-none absolute -top-32 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Leaf className="size-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">SmartWaste</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Centrum zarządzania infrastrukturą odpadową
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold">Zaloguj się</h2>
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
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {REAL ? "Połączono z SprigaAPI — dane logowania pre-wypełnione" : "Wersja demonstracyjna — dane pre-wypełnione"}
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          SmartWaste Platform v1.0 · Smart Utility Solutions
        </p>
      </div>
    </div>
  );
}
