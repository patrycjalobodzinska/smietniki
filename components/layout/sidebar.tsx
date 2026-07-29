"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { NAVIGATION } from "@/config/navigation";
import { useSession } from "@/lib/auth/session";
import { ROLES } from "@/config/roles";
import { cn } from "@/lib/utils/cn";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { has, user, role } = useSession();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/50 bg-background-secondary/70 backdrop-blur-xl transition-[width,transform] duration-200 lg:static lg:translate-x-0 dark:border-white/5",
          collapsed ? "w-[76px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold tracking-tight">SmartWaste</p>
              <p className="truncate text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Control Center
              </p>
            </div>
          )}
          <button
            onClick={onCloseMobile}
            className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-surface-hover lg:hidden"
            aria-label="Zamknij menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {NAVIGATION.map((section) => {
            const items = section.items.filter((i) => has(i.permission));
            if (!items.length) return null;
            return (
              <div key={section.title} className="space-y-1">
                {!collapsed && (
                  <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {section.title}
                  </p>
                )}
                {items.map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-primary/12 text-primary"
                          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                      )}
                    >
                      <Icon className="size-[18px] shrink-0" />
                      {!collapsed && item.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Profile + collapse */}
        <div className="border-t border-border p-3">
          <div className={cn("flex items-center gap-2.5 rounded-lg px-2 py-1.5", collapsed && "justify-center px-0")}>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {user.avatarInitials}
            </div>
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{ROLES[role].label}</p>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className={cn(
              "mt-2 hidden w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground lg:flex",
              collapsed && "justify-center px-0",
            )}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            {!collapsed && "Zwiń menu"}
          </button>
        </div>
      </aside>
    </>
  );
}
