# EcoRoute - panel zarządzania śmietnikami

Panel do optymalizacji tras śmieciarek na podstawie zapełnienia śmietników
(detekcja kamerami). Role: administrator, spółdzielnia, dyspozytor, kierowca.

Stack: **Next.js 16 (App Router) · React 19 · Tailwind v4 · TanStack Query v5**.

## Uruchomienie

Wymagany **Node ≥ 20** (jest `.nvmrc` → `nvm use`).

```bash
nvm use          # 22
npm install
npm run dev
```

### Backend: SprigaAPI vs mocki

Skopiuj `.env.example` → `.env.local`. Dwie zmienne sterują źródłem danych:

```bash
NEXT_PUBLIC_API_URL=https://spriga-api.essa.sx  # pusty = zawsze mocki
NEXT_PUBLIC_USE_MOCKS=false                      # true = wymuś mocki (demo offline)
```

Gdy `NEXT_PUBLIC_API_URL` jest ustawione i `USE_MOCKS≠true`, aplikacja działa na
żywym API (logowanie cookie `httpOnly`, `credentials: "include"` - bez tokenów w JS).
Przełącznik jest w `lib/api/config.ts`; serwisy wybierają implementację
mock/real (np. `services/infrastructure.{mock,real}.ts`) - hooki i UI bez zmian.

## Architektura

```
app/
  (dashboard)/          # ekrany za AppShell (sidebar + topbar)
    page.tsx            # pulpit
    smietniki/ trasy/ pojazdy/ uzytkownicy/ ustawienia/
  providers.tsx         # QueryClientProvider + SessionProvider
  globals.css           # DESIGN TOKENS (kolory, radius) - jedyne źródło prawdy
components/
  ui/                   # globalne prymitywy: Button, Input, Select, DataTable, Card, Dialog...
  domain/               # komponenty domenowe: FillBar, badge statusów/frakcji/ról
  layout/               # AppShell, Sidebar, Topbar, PageHeader
  auth/                 # PermissionGate
lib/
  types/                # model domenowy (Bin, CollectionRoute, Vehicle, User, Role)
  api/
    client.ts           # fetch wrapper (http.get/post/put/del) - pod realne API
    services/           # binsService, routesService... (dziś mock, potem http.*)
    hooks/              # useBins, useRoutes... (React Query)
    mock/               # dane + in-memory store
    query-keys.ts       # centralne klucze cache
  auth/session.tsx      # mock sesji + useSession() / has(permission)
  utils/                # cn(), format()
config/
  navigation.ts         # menu boczne (gated uprawnieniami)
  roles.ts              # role + macierz uprawnień + can()
```

## Zasady (trzymamy się schematu)

1. **Kolory tylko z tokenów.** Nigdy hex/oklch w komponencie - używaj klas
   `bg-primary`, `text-muted-foreground`, `border-border`, `bg-fill-critical`
   itd. Nowy kolor = nowy token w `app/globals.css`.
2. **Jeden globalny komponent na wzorzec.** Potrzebujesz tabeli → używasz
   `DataTable` (konfiguracja kolumn). Potrzebujesz pola formularza → `Field` +
   kontrolka z `components/ui`. Nie duplikujemy prymitywów.
3. **Dane przez hooki.** Ekran nie woła serwisu bezpośrednio - używa
   `useX()`/`useMutation`. Klucze cache z `qk` w `query-keys.ts`.
4. **Przejście na realne API** = podmiana ciał w `lib/api/services/*` na wywołania
   `http.*` + `NEXT_PUBLIC_API_URL`. Hooki i komponenty bez zmian.
5. **Uprawnienia deklaratywnie.** Sekcje/akcje sprawdzają `has(permission)` lub
   `<PermissionGate>`, nie porównują ról wprost. Nowa rola = wpis w `roles.ts`.

> Przełącznik ról w topbarze jest tymczasowy (dev) - zniknie po wpięciu auth.
