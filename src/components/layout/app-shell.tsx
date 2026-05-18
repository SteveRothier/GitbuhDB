"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0e14]">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Fermer le menu"
        />
      )}

      <Sidebar
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      />

      <div className="flex min-h-screen min-w-0 flex-col lg:ml-[260px]">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-white/[0.06] bg-[#0b0e14] px-4 lg:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-white/80 hover:bg-white/5"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-5" />
          </button>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
