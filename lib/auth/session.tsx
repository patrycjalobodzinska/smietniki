"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Role, User } from "@/lib/types";
import { can, type Permission } from "@/config/roles";
import { REAL } from "@/lib/api/config";
import { authService } from "@/lib/api/services/auth";

/**
 * Session context. Public shape (`useSession()`) is identical whether the app
 * runs on mocks or the live API.
 *
 * - Mocks: the demo defaults to the fully built-out `city_admin` role and the
 *   role switcher picks a canned user.
 * - Real: the signed-in user is loaded from SprigaAPI (`/v1/users/user`); a 401
 *   sends the visitor to /login. The role switcher still adjusts the demo view.
 */

const MOCK_USERS: Record<Role, User> = {
  city_admin: {
    id: "u-city",
    name: "Adam Kowalski",
    email: "admin@smartwaste.pl",
    role: "city_admin",
    organization: "Urząd Miasta Rzeszów",
    cooperativeId: null,
    avatarInitials: "AK",
  },
  system_admin: {
    id: "u-sys",
    name: "Ewa Nowak",
    email: "system@smartwaste.pl",
    role: "system_admin",
    organization: "SmartWaste Platform",
    cooperativeId: null,
    avatarInitials: "EN",
  },
  cooperative: {
    id: "u-coop",
    name: "SM Nowe Miasto",
    email: "biuro@nowemiasto.pl",
    role: "cooperative",
    organization: "SM Nowe Miasto",
    cooperativeId: "c-2",
    avatarInitials: "NM",
  },
  operator: {
    id: "u-op",
    name: "Remondis Rzeszów",
    email: "dyspozytor@remondis.pl",
    role: "operator",
    organization: "Remondis Rzeszów",
    cooperativeId: null,
    avatarInitials: "RR",
  },
  foreman: {
    id: "u-fore",
    name: "Piotr Wiśniewski",
    email: "brygada@remondis.pl",
    role: "foreman",
    organization: "Remondis Rzeszów",
    cooperativeId: null,
    avatarInitials: "PW",
  },
};

interface SessionContextValue {
  user: User;
  role: Role;
  setRole: (role: Role) => void;
  has: (permission: Permission) => boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/** Screens reachable without a session (login, registration, e-mail confirm). */
const PUBLIC_PATHS = ["/login", "/potwierdzenie", "/reset-hasla"];

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("city_admin");
  const [realUser, setRealUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!REAL) return;
    let cancelled = false;
    authService
      .me()
      .then((u) => {
        if (cancelled) return;
        setRealUser(u);
        setRole(u.role);
      })
      .catch(() => {
        if (!cancelled && !PUBLIC_PATHS.includes(pathname)) router.replace("/login");
      });
    return () => {
      cancelled = true;
    };
    // Bootstrap once on mount; pathname is read only to avoid a redirect loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const has = useCallback((permission: Permission) => can(role, permission), [role]);
  const value = useMemo<SessionContextValue>(
    () => ({ user: REAL ? realUser ?? MOCK_USERS[role] : MOCK_USERS[role], role, setRole, has }),
    [role, has, realUser],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <SessionProvider>");
  return ctx;
}
