"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Code2,
  Crown,
  GitCompare,
  GitBranch,
  Home,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const explorerLinks = [
  { href: "/", label: "Accueil", icon: Home, exact: true },
  { href: "/trending", label: "Trending", icon: TrendingUp },
  { href: "/trending?period=weekly", label: "Top Croissance", icon: BarChart3 },
  { href: "/trending", label: "Langages", icon: Code2 },
  { href: "#", label: "Comparer", icon: GitCompare, disabled: true },
  { href: "/#search", label: "Recherche", icon: Search },
];

const toolsLinks = [
  { label: "Mes Dépôts", icon: GitBranch },
  { label: "Favoris", icon: Star },
  { label: "Alertes", icon: Bell },
];

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  disabled,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  disabled?: boolean;
}) {
  const pathname = usePathname();
  const base = href.split("?")[0];
  const active =
    !disabled &&
    (exact ? pathname === href : href !== "#" && pathname === base);

  if (disabled) {
    return (
      <span className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/50">
        <Icon className="size-4 shrink-0" />
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary/20 font-medium text-primary"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  );
}

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "flex w-[240px] shrink-0 flex-col border-r border-border/60 bg-[#0a0d12]",
        className,
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-border/60 px-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
          <BarChart3 className="size-4" />
        </span>
        <span className="font-semibold tracking-tight">GitHub Tracker</span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Explorer
          </p>
          <div className="space-y-0.5">
            {explorerLinks.map((link) => (
              <NavLink key={link.label} {...link} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Outils
          </p>
          <div className="space-y-0.5">
            {toolsLinks.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/50"
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </nav>

      <div className="space-y-4 border-t border-border/60 p-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Crown className="size-4 text-amber-400" />
            Passez au Premium
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Analytics avancées, alertes et export CSV.
          </p>
          <button
            type="button"
            className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full")}
            disabled
          >
            Découvrir
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground">
          © 2024 GitHub Tracker
          <br />
          v1.0.0
        </p>
      </div>
    </aside>
  );
}
