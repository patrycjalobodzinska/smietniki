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
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-white/50 bg-background/60 px-4 backdrop-blur-xl lg:px-6 dark:border-white/5">
      <button
        onClick={onOpenMobile}
        className="rounded-md p-2 text-muted-foreground hover:bg-surface-hover lg:hidden"
        aria-label="Otwórz menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden max-w-md flex-1 md:block">
        <Input icon={<Search />} placeholder="Szukaj altanek, pojemników, adresów..." />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Dev-only role switcher — removed when real auth is wired. */}
        <Select
          options={ROLE_OPTIONS}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="hidden h-9 w-44 sm:block"
        />

        <Button variant="ghost" size="icon" aria-label="Powiadomienia" className="relative">
          <Bell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-danger" />
        </Button>
        <ThemeToggle />

        <div className="ml-1 flex size-9 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
          {user.avatarInitials}
        </div>
      </div>
    </header>
  );
}
