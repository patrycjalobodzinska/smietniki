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

const FEATURES: Feature[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, description: "Pulpit operacyjny — KPI, mapa i stan platformy na żywo." },
  { label: "Spółdzielnie", href: "/spoldzielnie", icon: Building2, description: "Zarządcy infrastruktury odpadowej wraz z ich obiektami." },
  { label: "Nieruchomości i lokale", href: "/nieruchomosci", icon: Home, description: "Budynki, lokale, mieszkańcy i przypisane klucze dostępu." },
  { label: "Altanki", href: "/altanki", icon: Warehouse, description: "Altanki śmietnikowe z poziomem cyfryzacji i zapełnieniem." },
  { label: "Pojemniki", href: "/pojemniki", icon: Trash2, description: "Pojemniki z bieżącym zapełnieniem, frakcją i źródłem danych." },
  { label: "Odbiory", href: "/odbiory", icon: Truck, description: "Historia i rejestracja operacji odbioru odpadów." },
  { label: "Trasy PGK", href: "/trasy", icon: Route, description: "Trasy odbioru i planowanie (dane z systemu)." },
  { label: "Sesje dostępu", href: "/sesje", icon: KeyRound, description: "Historia autoryzacji dostępu (RFID) do altanek." },
  { label: "Analityka", href: "/analityka", icon: LineChart, description: "Wskaźniki, przepełnienia i rankingi liczone na żywo." },
  { label: "Ustawienia", href: "/ustawienia", icon: Settings, description: "Profil użytkownika i preferencje systemu." },
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {FEATURES.map((f) => (
          <FeatureCard key={f.href} f={f} />
        ))}
      </div>
    </div>
  );
}
