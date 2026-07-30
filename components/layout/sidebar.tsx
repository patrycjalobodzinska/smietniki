"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Leaf, LogOut, X } from "lucide-react";
import { NAVIGATION } from "@/config/navigation";
import { useSession } from "@/lib/auth/session";
import { authService } from "@/lib/api/services/auth";
import { cn } from "@/lib/utils/cn";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { has, user } = useSession();

  async function handleLogout() {
    try {
      await authService.signOut();
    } catch {
      /* ignore — redirect regardless */
    }
    router.replace("/login");
  }

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-20 flex-col items-center border-r border-border bg-card py-4 transition-transform duration-200 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="relative flex w-full items-center justify-center">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-forest text-lime">
            <Leaf className="size-5" />
          </div>
          <button
            onClick={onCloseMobile}
            className="absolute right-3 rounded-full p-1 text-muted-foreground hover:bg-surface-hover lg:hidden"
            aria-label="Zamknij menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav — icon rail, groups separated by a spacer */}
        <nav className="mt-8 flex flex-1 flex-col items-center gap-2 overflow-y-auto">
          {NAVIGATION.map((section, si) => {
            const items = section.items.filter((i) => has(i.permission));
            if (!items.length) return null;
            return (
              <div key={section.title} className="flex flex-col items-center gap-2">
                {si > 0 && <span className="my-1 h-px w-6 bg-border" />}
                {items.map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      title={item.label}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex size-11 items-center justify-center rounded-2xl transition-colors",
                        active
                          ? "bg-lime text-forest"
                          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                      )}
                    >
                      <Icon className="size-5" />
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Identity + logout */}
        <div className="mt-4 flex flex-col items-center gap-3">
          <div
            className="flex size-9 items-center justify-center rounded-full bg-lime/50 text-xs font-semibold text-forest"
            title={user.name}
          >
            {user.avatarInitials}
          </div>
          <button
            onClick={handleLogout}
            title="Wyloguj"
            aria-label="Wyloguj"
            className="flex size-11 items-center justify-center rounded-full bg-coral text-coral-foreground transition-transform hover:scale-105"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </aside>
    </>
  );
}
