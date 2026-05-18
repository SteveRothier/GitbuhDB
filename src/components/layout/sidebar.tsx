"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  BarChart3,
  Bell,
  CirclePlus,
  GitCompare,
  Heart,
  Home,
  Moon,
  TrendingUp,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = 260;

const explorerLinks = [
  { href: "/trending", label: "Trending", icon: Moon, id: "trending" },
  {
    href: "/trending?period=weekly",
    label: "Top Croissance",
    icon: TrendingUp,
    id: "weekly",
  },
  { href: "/#languages", label: "Langages", icon: CirclePlus, id: "languages" },
  { href: "#", label: "Comparer", icon: GitCompare, id: "compare", disabled: true },
];

const toolsLinks = [
  { label: "Mes Dépôts", icon: User },
  { label: "Favoris", icon: Heart },
  { label: "Alertes", icon: Bell },
];

function navItemClass(active: boolean, disabled?: boolean) {
  return cn(
    "flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] leading-none transition-colors",
    disabled
      ? "cursor-not-allowed text-white/35"
      : active
        ? "bg-violet-600/25 font-medium text-white"
        : "text-white/70 hover:bg-white/5 hover:text-white",
  );
}

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const period = searchParams.get("period");

  const isHome = pathname === "/";
  const isTrending = pathname === "/trending";
  const isTrendingWeekly = isTrending && period === "weekly";
  const isTrendingDefault = isTrending && period !== "weekly";

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0d12]">
      <div className="flex h-16 shrink-0 items-center gap-3 px-5">
        <span className="flex size-10 items-center justify-center rounded-full bg-violet-600 text-white">
          <BarChart3 className="size-5" />
        </span>
        <span className="text-lg font-semibold tracking-tight text-white">
          GitHub Tracker
        </span>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-4 pb-6">
        <Link
          href="/"
          className={cn(
            "mb-6 flex h-12 items-center gap-3 rounded-xl px-4 text-[15px] font-medium transition-colors",
            isHome
              ? "bg-violet-600/30 text-white"
              : "text-white/70 hover:bg-white/5 hover:text-white",
          )}
        >
          <Home className="size-[18px] shrink-0" />
          Accueil
        </Link>

        <p className="mb-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
          Explorer
        </p>
        <div className="space-y-1">
          {explorerLinks.map((link) => {
            const { href, label, icon: Icon, id, disabled } = link;
            let active = false;
            if (id === "trending") active = isTrendingDefault;
            if (id === "weekly") active = isTrendingWeekly;

            if (disabled) {
              return (
                <span key={label} className={navItemClass(false, true)}>
                  <Icon className="size-[18px] shrink-0 opacity-50" />
                  {label}
                </span>
              );
            }

            return (
              <Link key={label} href={href} className={navItemClass(active)}>
                <Icon className="size-[18px] shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="my-6 border-t border-white/[0.06]" />

        <p className="mb-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
          Outils
        </p>
        <div className="space-y-1">
          {toolsLinks.map(({ label, icon: Icon }) => (
            <span key={label} className={navItemClass(false, true)}>
              <Icon className="size-[18px] shrink-0 opacity-50" />
              {label}
            </span>
          ))}
        </div>
      </nav>
    </aside>
  );
}

function SidebarFallback() {
  return (
    <aside className="h-screen w-[260px] shrink-0 border-r border-white/[0.06] bg-[#0a0d12]" />
  );
}

export function Sidebar({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Suspense fallback={<SidebarFallback />}>
        <SidebarContent />
      </Suspense>
    </div>
  );
}

export { SIDEBAR_WIDTH };
