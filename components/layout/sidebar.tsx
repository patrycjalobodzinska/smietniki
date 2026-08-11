"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Leaf, LogOut, X } from "lucide-react";
import { NAVIGATION } from "@/config/navigation";
import { useSession } from "@/lib/auth/session";
import { authService } from "@/lib/api/services/auth";
import { setFullMode, useFullMode } from "@/lib/full-mode";
import { ThemeToggle } from "./theme-toggle";
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
  const fullMode = useFullMode();

  async function handleLogout() {
    try {
      await authService.signOut();
    } catch {
      /* ignore — redirect regardless */
    }
    setFullMode(false);
    router.replace("/login");
  }

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 m-0 flex w-20 flex-col items-center bg-forest py-4 text-forest-foreground transition-transform duration-200 lg:static lg:my-3 lg:ml-3 lg:h-[calc(100vh-1.5rem)] lg:w-20 lg:rounded-3xl lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="relative flex w-full items-center justify-center">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-lime text-forest">
            <Leaf className="size-5" />
          </div>
          <button
            onClick={onCloseMobile}
            className="absolute right-3 rounded-full p-1 text-forest-foreground/70 hover:bg-white/10 lg:hidden"
            aria-label="Zamknij menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav — scrollable icon rail (hidden scrollbar), groups separated by a spacer.
            Native title tooltips: they never clip, even while the rail scrolls. */}
        <nav className="mt-6 flex min-h-0 flex-1 flex-col items-center gap-1.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAVIGATION.map((section, si) => {
            const items = section.items.filter((i) => has(i.permission) && (!i.full || fullMode));
            if (!items.length) return null;
            return (
              <div key={section.title} className="flex flex-col items-center gap-1.5">
                {si > 0 && <span className="my-1 h-px w-6 shrink-0 bg-white/15" />}
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
                        "flex size-11 shrink-0 items-center justify-center rounded-2xl transition-colors",
                        active
                          ? "bg-lime text-forest"
                          : "text-forest-foreground/55 hover:bg-white/10 hover:text-forest-foreground",
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

        {/* Theme + identity + logout */}
        <div className="mt-4 flex shrink-0 flex-col items-center gap-3">
          <ThemeToggle />
          <div
            className="flex size-9 items-center justify-center rounded-full bg-lime/50 text-xs font-semibold text-forest"
            title={user.name}
          >
            {user.avatarInitials}
          </div>
          <div className="group relative">
            <button
              onClick={handleLogout}
              aria-label="Wyloguj"
              className="flex size-11 items-center justify-center rounded-full bg-coral text-coral-foreground transition-transform hover:scale-105"
            >
              <LogOut className="size-5" />
            </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-1/2 left-full z-50 ml-3 translate-y-1/2 whitespace-nowrap rounded-lg bg-forest px-2.5 py-1.5 text-xs font-medium text-forest-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
            >
              Wyloguj
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
