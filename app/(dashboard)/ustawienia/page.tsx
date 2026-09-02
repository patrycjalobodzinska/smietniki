"use client";

import { useState } from "react";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  DescriptionList,
  Field,
  Input,
  Select,
} from "@/components/ui";
import { useSession } from "@/lib/auth/session";
import { useIsDark } from "@/lib/hooks/use-is-dark";
import {
  useAccount,
  useChangePassword,
  useSetAccountEmail,
  useSetAccountPhone,
} from "@/lib/api/hooks/use-users";
import { ROLES } from "@/config/roles";
import { formatDateTime } from "@/lib/utils/format";

type Theme = "dark" | "light";

/** Small inline status line for a card-level form. */
function FormStatus({ error, ok }: { error?: string | null; ok?: string | null }) {
  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (ok) return <p className="text-sm text-success">{ok}</p>;
  return null;
}

function PasswordCard() {
  const change = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function submit() {
    setError(null);
    setOk(null);
    if (!current || !next) return setError("Podaj obecne i nowe hasło.");
    if (next !== confirm) return setError("Nowe hasła nie są identyczne.");
    change.mutate(
      { currentPassword: current, newPassword: next, confirmNewPassword: confirm },
      {
        onSuccess: () => {
          setCurrent("");
          setNext("");
          setConfirm("");
          setOk("Hasło zostało zmienione.");
        },
        onError: () => setError("Nie udało się zmienić hasła — sprawdź obecne hasło i wymagania."),
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hasło</CardTitle>
        <CardDescription>Zmiana hasła do konta w systemie.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Obecne hasło">
          {({ id }) => (
            <Input id={id} type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
          )}
        </Field>
        <Field label="Nowe hasło">
          {({ id }) => (
            <Input id={id} type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
          )}
        </Field>
        <Field label="Powtórz nowe hasło">
          {({ id }) => (
            <Input id={id} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          )}
        </Field>
        <FormStatus error={error} ok={ok} />
      </CardContent>
      <CardFooter>
        <Button onClick={submit} loading={change.isPending}>
          Zmień hasło
        </Button>
      </CardFooter>
    </Card>
  );
}

function ContactCard() {
  const { data: account } = useAccount();
  const setEmail = useSetAccountEmail();
  const setPhone = useSetAccountPhone();

  // Null means "not edited yet" — the field then shows the loaded account
  // value, so no effect is needed to seed the form.
  const [emailEdit, setEmailValue] = useState<string | null>(null);
  const [prefixEdit, setPrefix] = useState<string | null>(null);
  const [phoneEdit, setPhoneValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const email = emailEdit ?? account?.email ?? "";
  const phone = phoneEdit ?? account?.phone ?? "";
  const prefix = prefixEdit ?? (account?.phonePrefix ? String(account.phonePrefix) : "48");

  function saveEmail() {
    setError(null);
    setOk(null);
    if (!email.trim()) return setError("Podaj adres e-mail.");
    setEmail.mutate(email, {
      onSuccess: () => setOk("Adres e-mail zaktualizowany — wymaga potwierdzenia."),
      onError: () => setError("Nie udało się zmienić adresu e-mail."),
    });
  }

  function savePhone() {
    setError(null);
    setOk(null);
    const p = prefix.trim() === "" ? null : Number(prefix);
    if (p !== null && Number.isNaN(p)) return setError("Prefiks musi być liczbą (np. 48).");
    setPhone.mutate(
      { prefix: p, phoneNumber: phone },
      {
        onSuccess: () => setOk("Numer telefonu zaktualizowany."),
        onError: () => setError("Nie udało się zmienić numeru telefonu."),
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dane kontaktowe</CardTitle>
        <CardDescription>Adres e-mail i telefon powiązane z kontem.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Email">
          {({ id }) => (
            <div className="flex gap-2">
              <Input id={id} type="email" value={email} onChange={(e) => setEmailValue(e.target.value)} />
              <Button variant="outline" onClick={saveEmail} loading={setEmail.isPending}>
                Zapisz
              </Button>
            </div>
          )}
        </Field>
        <div className="flex items-end gap-2">
          <Field label="Prefiks" className="w-24">
            {({ id }) => <Input id={id} value={prefix} onChange={(e) => setPrefix(e.target.value)} inputMode="numeric" />}
          </Field>
          <Field label="Telefon" className="flex-1">
            {({ id }) => <Input id={id} value={phone} onChange={(e) => setPhoneValue(e.target.value)} inputMode="tel" />}
          </Field>
          <Button variant="outline" onClick={savePhone} loading={setPhone.isPending}>
            Zapisz
          </Button>
        </div>
        <FormStatus error={error} ok={ok} />
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { user, role } = useSession();
  const { data: account } = useAccount();
  // Reflects the live `.dark` class, so the select stays in sync with the
  // toggle in the sidebar.
  const theme: Theme = useIsDark() ? "dark" : "light";

  function applyTheme(next: Theme) {
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
      <PageHeader title="Ustawienia" description="Konto użytkownika, bezpieczeństwo i preferencje interfejsu." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Dane konta z systemu uwierzytelniania.</CardDescription>
          </CardHeader>
          <CardContent>
            <DescriptionList
              columns={3}
              items={[
                { label: "Email", value: account?.email ?? user.email },
                { label: "Rola w panelu", value: ROLES[role].label },
                {
                  label: "Role systemowe",
                  value: account?.roles.length ? account.roles.join(", ") : "—",
                },
                {
                  label: "Status konta",
                  value:
                    account?.state === "locked" ? (
                      <Badge variant="danger" dot>Zablokowane</Badge>
                    ) : (
                      <Badge variant="success" dot>Aktywne</Badge>
                    ),
                },
                {
                  label: "Email potwierdzony",
                  value: account?.emailConfirmed ? (
                    <span className="inline-flex items-center gap-1 text-success">
                      <BadgeCheck className="size-3.5" /> tak
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-warning">
                      <ShieldAlert className="size-3.5" /> nie
                    </span>
                  ),
                },
                {
                  label: "Ostatnia zmiana hasła",
                  value: account?.lastPasswordChangeAt
                    ? formatDateTime(account.lastPasswordChangeAt)
                    : "—",
                },
                { label: "Telefon", value: account?.phone ?? "—" },
                {
                  label: "Konto utworzone",
                  value: account?.createdAt ? formatDateTime(account.createdAt) : "—",
                },
                { label: "Rejestracja", value: account?.registrationProvider ?? "—" },
              ]}
            />
          </CardContent>
        </Card>

        <PasswordCard />
        <ContactCard />

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Wygląd</CardTitle>
            <CardDescription>Motyw interfejsu (dostępny też w górnym pasku).</CardDescription>
          </CardHeader>
          <CardContent>
            <Field label="Motyw" className="max-w-xs">
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
