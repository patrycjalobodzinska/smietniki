"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";

/** Authenticated layout: sidebar rail + scrollable content (no top header). */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Mobile menu trigger (no header on the panel). */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Otwórz menu"
        className="fixed left-4 top-4 z-30 flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <main className="flex-1 overflow-y-auto px-4 pb-8 pt-16 lg:px-6 lg:pb-8 lg:pt-6">{children}</main>
    </div>
  );
}
