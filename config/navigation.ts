import {
  LayoutDashboard,
  Warehouse,
  Trash2,
  KeyRound,
  KeySquare,
  Router,
  LineChart,
  Truck,
  Route,
  Building2,
  Home,
  LayoutGrid,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/config/roles";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
  /** Shown only in the hidden "full mode" (see lib/full-mode.ts). */
  full?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Sidebar structure. KM1 modules are always visible; items marked `full` appear
 * only when the hidden full mode is unlocked (extra subject/logistics modules).
 */
export const NAVIGATION: NavSection[] = [
  {
    title: "Operacje",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard, permission: "dashboard.view" },
      { label: "Analityka", href: "/analityka", icon: LineChart, permission: "analytics.view" },
      { label: "Odbiory", href: "/odbiory", icon: Truck, permission: "collections.view", full: true },
      { label: "Trasy PGK", href: "/trasy", icon: Route, permission: "routes.view", full: true },
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
      { label: "Spółdzielnie", href: "/spoldzielnie", icon: Building2, permission: "cooperatives.view", full: true },
      { label: "Nieruchomości", href: "/nieruchomosci", icon: Home, permission: "properties.view", full: true },
    ],
  },
  {
    title: "Więcej",
    items: [
      { label: "Wszystkie funkcje", href: "/features", icon: LayoutGrid, permission: "dashboard.view", full: true },
    ],
  },
  {
    title: "Konto",
    items: [
      { label: "Ustawienia", href: "/ustawienia", icon: Settings, permission: "settings.manage" },
    ],
  },
];
