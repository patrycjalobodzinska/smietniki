"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Select,
  Field,
} from "@/components/ui";
import { useSession } from "@/lib/auth/session";
import { ROLES } from "@/config/roles";

type Theme = "dark" | "light";

export default function SettingsPage() {
  const { user, role } = useSession();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function applyTheme(next: Theme) {
    setTheme(next);
    const dark = next === "dark";
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Ustawienia" description="Profil użytkownika i preferencje interfejsu." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Dane zalogowanego konta (tylko do odczytu).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Email">{({ id }) => <Input id={id} value={user.email} disabled />}</Field>
            <Field label="Rola">{({ id }) => <Input id={id} value={ROLES[role].label} disabled />}</Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wygląd</CardTitle>
            <CardDescription>Motyw interfejsu (dostępny też w górnym pasku).</CardDescription>
          </CardHeader>
          <CardContent>
            <Field label="Motyw">
              {({ id }) => (
                <Select
                  id={id}
                  value={theme}
                  onChange={(e) => applyTheme(e.target.value as Theme)}
                  options={[
                    { value: "light", label: "Jasny" },
                    { value: "dark", label: "Ciemny" },
                  ]}
                />
              )}
            </Field>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
