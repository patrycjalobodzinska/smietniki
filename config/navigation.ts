import {
  LayoutDashboard,
  Building2,
  Home,
  Warehouse,
  Trash2,
  Truck,
  Route,
  KeyRound,
  KeySquare,
  LayoutGrid,
  Router,
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
 * Sidebar structure. Only modules backed by real data (SprigaAPI) live in the
 * main navigation. The complete feature set — including modules still on mock
 * data — is reachable from the "Wszystkie funkcje" (/features) catalog.
 */
export const NAVIGATION: NavSection[] = [
  {
    title: "Operacje",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard, permission: "dashboard.view" },
      { label: "Odbiory", href: "/odbiory", icon: Truck, permission: "collections.view" },
      { label: "Trasy PGK", href: "/trasy", icon: Route, permission: "routes.view" },
    ],
  },
  {
    title: "Infrastruktura",
    items: [
      { label: "Spółdzielnie", href: "/spoldzielnie", icon: Building2, permission: "cooperatives.view" },
      { label: "Nieruchomości", href: "/nieruchomosci", icon: Home, permission: "properties.view" },
      { label: "Altanki", href: "/altanki", icon: Warehouse, permission: "stations.view" },
      { label: "Pojemniki", href: "/pojemniki", icon: Trash2, permission: "containers.view" },
      { label: "Urządzenia", href: "/urzadzenia", icon: Router, permission: "stations.view" },
      { label: "Klucze dostępu", href: "/klucze", icon: KeySquare, permission: "sessions.view" },
      { label: "Sesje dostępu", href: "/sesje", icon: KeyRound, permission: "sessions.view" },
    ],
  },
  {
    title: "Więcej",
    items: [
      { label: "Wszystkie funkcje", href: "/features", icon: LayoutGrid, permission: "dashboard.view" },
    ],
  },
  {
    title: "Konto",
    items: [
      { label: "Ustawienia", href: "/ustawienia", icon: Settings, permission: "settings.manage" },
    ],
  },
];
