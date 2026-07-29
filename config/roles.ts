import type { Role } from "@/lib/types";

/**
 * Role metadata. In the MVP the fully built-out role is `city_admin`;
 * the others exist in the data model and are shown as labels/badges.
 */
export const ROLES: Record<
  Role,
  { label: string; description: string; tone: "primary" | "info" | "warning" | "muted" }
> = {
  city_admin: {
    label: "Administrator miasta",
    description: "Pełny dostęp operacyjny i analityczny.",
    tone: "primary",
  },
  system_admin: {
    label: "Administrator systemu",
    description: "Warstwa platformowa: organizacje, wdrożenia.",
    tone: "primary",
  },
  cooperative: {
    label: "Zarządca / spółdzielnia",
    description: "Podgląd własnej infrastruktury i kluczy.",
    tone: "info",
  },
  operator: {
    label: "Operator odbioru",
    description: "Planowanie i realizacja tras odbioru.",
    tone: "warning",
  },
  foreman: {
    label: "Brygadzista",
    description: "Uproszczony widok terenowy.",
    tone: "muted",
  },
};

/**
 * Capability flags. Screens/actions check these instead of comparing roles,
 * so adding a role means editing one table (spec keeps full RBAC out of MVP).
 */
export type Permission =
  | "dashboard.view"
  | "collections.view"
  | "routes.view"
  | "routes.manage"
  | "analytics.view"
  | "cooperatives.view"
  | "properties.view"
  | "properties.manage"
  | "stations.view"
  | "containers.view"
  | "sessions.view"
  | "settings.manage";

const ALL: Permission[] = [
  "dashboard.view",
  "collections.view",
  "routes.view",
  "routes.manage",
  "analytics.view",
  "cooperatives.view",
  "properties.view",
  "properties.manage",
  "stations.view",
  "containers.view",
  "sessions.view",
  "settings.manage",
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  city_admin: ALL,
  system_admin: ALL,
  cooperative: [
    "dashboard.view",
    "cooperatives.view",
    "properties.view",
    "properties.manage",
    "stations.view",
    "containers.view",
    "sessions.view",
    "collections.view",
  ],
  operator: [
    "dashboard.view",
    "collections.view",
    "routes.view",
    "routes.manage",
    "stations.view",
    "containers.view",
  ],
  foreman: ["dashboard.view", "routes.view", "collections.view", "stations.view"],
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
