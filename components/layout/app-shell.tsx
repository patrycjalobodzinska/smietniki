"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

/** Authenticated layout: collapsible sidebar + sticky topbar + scrollable content. */
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
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 pb-6 pt-1 lg:px-6 lg:pb-8 lg:pt-2">{children}</main>
      </div>
    </div>
  );
}
