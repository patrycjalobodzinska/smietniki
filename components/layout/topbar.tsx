"use client";

import { Bell, Menu, Search } from "lucide-react";
import { useSession } from "@/lib/auth/session";
import { ROLES } from "@/config/roles";
import type { Role } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

const ROLE_OPTIONS = (Object.keys(ROLES) as Role[]).map((r) => ({ value: r, label: ROLES[r].label }));

export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { user, role, setRole } = useSession();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 bg-transparent px-4 lg:px-6">
      <button
        onClick={onOpenMobile}
        className="rounded-full p-2 text-muted-foreground hover:bg-surface-hover lg:hidden"
        aria-label="Otwórz menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden max-w-md flex-1 md:block">
        <Input
          icon={<Search />}
          placeholder="Szukaj altanek, pojemników, adresów..."
          className="h-11 rounded-full! bg-card"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Dev-only role switcher — removed when real auth is wired. */}
        <Select
          options={ROLE_OPTIONS}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="hidden h-10 w-44 rounded-full! sm:block"
        />

        <ThemeToggle />

        <Button variant="ghost" size="icon" aria-label="Powiadomienia" className="relative border border-border bg-card">
          <Bell className="size-[18px]" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-coral" />
        </Button>

        <div className="flex size-10 items-center justify-center rounded-full bg-lime/50 text-xs font-semibold text-forest">
          {user.avatarInitials}
        </div>
      </div>
    </header>
  );
}
