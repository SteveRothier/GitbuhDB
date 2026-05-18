"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Accueil", exact: true },
  { href: "/trending", label: "Trending" },
  { href: "#", label: "Comparer", disabled: true },
  { href: "/trending", label: "Langages" },
  { href: "#", label: "À propos", disabled: true },
];

export function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/60 bg-[#0b0e14]/95 px-4 backdrop-blur-md lg:px-6">
      <button
        type="button"
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted/40 lg:hidden"
        onClick={onMenuClick}
        aria-label="Menu"
      >
        <Menu className="size-5" />
      </button>

      <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
        {navLinks.map(({ href, label, exact, disabled }) => {
          const active = !disabled && (exact ? pathname === href : pathname === href.split("?")[0]);

          if (disabled) {
            return (
              <span
                key={label}
                className="cursor-not-allowed text-sm text-muted-foreground/50"
              >
                {label}
              </span>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "relative pb-0.5 text-sm transition-colors",
                active
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
              {active && (
                <span className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted/40"
          aria-label="Thème"
        >
          <Sun className="size-5" />
        </button>
        <button
          type="button"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          disabled
        >
          Se connecter
        </button>
      </div>
    </header>
  );
}
