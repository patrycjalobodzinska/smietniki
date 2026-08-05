import {
  LayoutDashboard,
  Warehouse,
  Trash2,
  KeyRound,
  KeySquare,
  Router,
  LineChart,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/config/roles";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Sidebar structure — KM1 scope only (OT ingest domain: bin stations,
 * containers, access sessions/keys, fill measurements, snapshots). The
 * subject/logistics layer (odbiory, trasy, pojazdy, spółdzielnie, lokale) is
 * intentionally out of scope and kept on the `pelny-zakres` branch.
 */
export const NAVIGATION: NavSection[] = [
  {
    title: "Operacje",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard, permission: "dashboard.view" },
      { label: "Analityka", href: "/analityka", icon: LineChart, permission: "analytics.view" },
    ],
  },
  {
    title: "Infrastruktura",
    items: [
      { label: "Altanki", href: "/altanki", icon: Warehouse, permission: "stations.view" },
      { label: "Pojemniki", href: "/pojemniki", icon: Trash2, permission: "containers.view" },
      { label: "Urządzenia", href: "/urzadzenia", icon: Router, permission: "stations.view" },
      { label: "Klucze dostępu", href: "/klucze", icon: KeySquare, permission: "sessions.view" },
      { label: "Sesje dostępu", href: "/sesje", icon: KeyRound, permission: "sessions.view" },
    ],
  },
  {
    title: "Konto",
    items: [
      { label: "Ustawienia", href: "/ustawienia", icon: Settings, permission: "settings.manage" },
    ],
  },
];
