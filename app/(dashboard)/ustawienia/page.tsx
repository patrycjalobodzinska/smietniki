"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Select,
  Field,
  Switch,
} from "@/components/ui";
import { useSession } from "@/lib/auth/session";
import { ROLES } from "@/config/roles";

export default function SettingsPage() {
  const { user, role } = useSession();
  const [notifOverfill, setNotifOverfill] = useState(true);
  const [notifAnomaly, setNotifAnomaly] = useState(true);
  const [notifRoutes, setNotifRoutes] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Ustawienia" description="Profil użytkownika i preferencje systemu." />

      <div className="grid max-w-2xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Dane konta użytkownika.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Imię i nazwisko">{({ id }) => <Input id={id} defaultValue={user.name} />}</Field>
            <Field label="Email">{({ id }) => <Input id={id} type="email" defaultValue={user.email} />}</Field>
            <Field label="Rola">{({ id }) => <Input id={id} defaultValue={ROLES[role].label} disabled />}</Field>
            <Field label="Organizacja">{({ id }) => <Input id={id} defaultValue={user.organization} />}</Field>
          </CardContent>
          <CardFooter>
            <Button>Zapisz zmiany</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferencje</CardTitle>
            <CardDescription>Język i wygląd interfejsu.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Język">
              {({ id }) => (
                <Select id={id} defaultValue="pl" options={[{ value: "pl", label: "Polski" }, { value: "en", label: "English" }]} />
              )}
            </Field>
            <Field label="Motyw" hint="Przełącznik motywu dostępny też w górnym pasku.">
              {({ id }) => (
                <Select id={id} defaultValue="dark" options={[{ value: "dark", label: "Ciemny" }, { value: "light", label: "Jasny" }]} />
              )}
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Powiadomienia</CardTitle>
            <CardDescription>Które zdarzenia mają generować alerty.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Przepełnienia pojemników", desc: "Alert gdy pojemnik przekroczy próg krytyczny.", val: notifOverfill, set: setNotifOverfill },
              { label: "Anomalie dostępu", desc: "Podejrzane sesje wejścia do altanki.", val: notifAnomaly, set: setNotifAnomaly },
              { label: "Zmiany w trasach", desc: "Powiadomienia o modyfikacjach tras PGK.", val: notifRoutes, set: setNotifRoutes },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-sm text-muted-foreground">{n.desc}</p>
                </div>
                <Switch checked={n.val} onCheckedChange={n.set} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
