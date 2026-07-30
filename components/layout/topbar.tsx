"use client";

import { Menu } from "lucide-react";
import { useSession } from "@/lib/auth/session";
import { ThemeToggle } from "./theme-toggle";

export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { user } = useSession();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 bg-transparent px-4 lg:px-6">
      <button
        onClick={onOpenMobile}
        className="rounded-full p-2 text-muted-foreground hover:bg-surface-hover lg:hidden"
        aria-label="Otwórz menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <div className="flex size-10 items-center justify-center rounded-full bg-lime/50 text-xs font-semibold text-forest">
          {user.avatarInitials}
        </div>
      </div>
    </header>
  );
}
