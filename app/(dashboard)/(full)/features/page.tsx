import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  Home,
  Warehouse,
  Trash2,
  Settings,
  Truck,
  Route,
  LineChart,
  KeyRound,
  KeySquare,
  Router,
  Gauge,
  Activity,
  Car,
  Users,
  History,
  Mail,
  Bell,
  FileText,
  Files,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui";

interface Feature {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

interface FeatureGroup {
  title: string;
  description: string;
  features: Feature[];
}

const OPERATIONS: Feature[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, description: "Pulpit operacyjny — KPI, mapa i stan platformy na żywo." },
  { label: "Spółdzielnie", href: "/spoldzielnie", icon: Building2, description: "Zarządcy infrastruktury odpadowej wraz z ich obiektami." },
  { label: "Nieruchomości i lokale", href: "/nieruchomosci", icon: Home, description: "Budynki, lokale, mieszkańcy i przypisane klucze dostępu." },
  { label: "Altanki", href: "/altanki", icon: Warehouse, description: "Altanki śmietnikowe z poziomem cyfryzacji i zapełnieniem." },
  { label: "Pojemniki", href: "/pojemniki", icon: Trash2, description: "Pojemniki z bieżącym zapełnieniem, frakcją i źródłem danych." },
  { label: "Odbiory", href: "/odbiory", icon: Truck, description: "Historia i rejestracja operacji odbioru odpadów." },
  { label: "Trasy PGK", href: "/trasy", icon: Route, description: "Trasy odbioru i planowanie (dane z systemu)." },
  { label: "Sesje dostępu", href: "/sesje", icon: KeyRound, description: "Historia autoryzacji dostępu (RFID) do altanek." },
  { label: "Analityka", href: "/analityka", icon: LineChart, description: "Wskaźniki, przepełnienia i rankingi liczone na żywo." },
  { label: "Ustawienia", href: "/ustawienia", icon: Settings, description: "Konto, hasło, dane kontaktowe i motyw interfejsu." },
];

const INFRASTRUCTURE: Feature[] = [
  { label: "Klucze dostępu", href: "/klucze", icon: KeySquare, description: "Wydawanie i unieważnianie kluczy/kart RFID." },
  { label: "Pomiary zapełnienia", href: "/pomiary", icon: Gauge, description: "Telemetria zapełnienia i ręczne wpisy pomiarów." },
  { label: "Urządzenia", href: "/urzadzenia", icon: Router, description: "Urządzenia OT: łączność, nazwy i przypisanie do altanek." },
  { label: "Zdarzenia z urządzeń", href: "/zdarzenia", icon: Activity, description: "Surowy ingest ISAPI: retransmisje, opóźnienia, snapshoty." },
  { label: "Pojazdy", href: "/pojazdy", icon: Car, description: "Flota realizująca odbiory, przypisywana do tras." },
];

const PLATFORM: Feature[] = [
  { label: "Użytkownicy", href: "/uzytkownicy", icon: Users, description: "Konta platformy, role systemowe i blokady." },
  { label: "Aktywność", href: "/aktywnosc", icon: History, description: "Dziennik audytowy: logowania, zmiany, zdarzenia domenowe." },
  { label: "Wiadomości e-mail", href: "/wiadomosci", icon: Mail, description: "Log wiadomości transakcyjnych i statusy dostarczenia." },
  { label: "Powiadomienia push", href: "/powiadomienia", icon: Bell, description: "Log powiadomień mobilnych i rejestracja urządzeń." },
  { label: "Treści", href: "/tresci", icon: FileText, description: "Artykuły i kategorie komunikatów dla mieszkańców." },
  { label: "Pliki", href: "/pliki", icon: Files, description: "Magazyn plików: wgrywanie, podgląd i usuwanie." },
];

const GROUPS: FeatureGroup[] = [
  {
    title: "Operacje i infrastruktura",
    description: "Rdzeń panelu — dane osiedlowe, zapełnienie i logistyka odbioru.",
    features: OPERATIONS,
  },
  {
    title: "Telemetria i urządzenia",
    description: "Warstwa OT: pomiary, ingest zdarzeń, konfiguracja urządzeń i flota.",
    features: INFRASTRUCTURE,
  },
  {
    title: "Platforma",
    description: "Warstwa systemowa backendu: tożsamość, komunikacja, treści i pliki.",
    features: PLATFORM,
  },
];

function FeatureCard({ f }: { f: Feature }) {
  const Icon = f.icon;
  return (
    <Link href={f.href} className="group">
      <Card className="flex h-full items-start gap-4 p-5 transition-transform duration-150 group-hover:-translate-y-0.5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-tight">{f.label}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
        </div>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Card>
    </Link>
  );
}

export default function FeaturesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Wszystkie funkcje"
        description="Pełen zakres platformy — wszystkie moduły działają na danych na żywo z systemu."
      />
      {GROUPS.map((g) => (
        <section key={g.title} className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{g.title}</h2>
            <p className="text-sm text-muted-foreground">{g.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {g.features.map((f) => (
              <FeatureCard key={f.href} f={f} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
