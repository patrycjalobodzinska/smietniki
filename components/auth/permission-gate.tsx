"use client";

import { ShieldAlert } from "lucide-react";
import { useSession } from "@/lib/auth/session";
import type { Permission } from "@/config/roles";
import { EmptyState } from "@/components/ui";

/**
 * Renders children only if the current role holds `permission`.
 * `fallback` defaults to an access-denied notice; pass `null` to hide silently.
 */
export function PermissionGate({
  permission,
  children,
  fallback,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { has } = useSession();
  if (has(permission)) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;
  return (
    <EmptyState
      icon={ShieldAlert}
      title="Brak dostępu"
      description="Twoja rola nie ma uprawnień do tej sekcji."
    />
  );
}
