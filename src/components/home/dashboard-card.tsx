import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardCardProps = {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  href?: string;
  subtitle?: string;
  children: ReactNode;
} & Pick<ComponentProps<"section">, "id">;

export function DashboardCard({
  id,
  icon: Icon,
  iconClassName,
  title,
  href,
  subtitle,
  children,
}: DashboardCardProps) {
  return (
    <section
      id={id}
      className="flex h-full min-h-[320px] flex-col rounded-xl border border-border/50 bg-[#111827]/90 p-5 scroll-mt-20"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className={cn("size-5 shrink-0", iconClassName ?? "text-primary")} />
          <h2 className="truncate text-base font-semibold">{title}</h2>
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 text-xs font-medium text-primary hover:text-primary/80"
          >
            Voir tout
          </Link>
        )}
      </div>
      {subtitle && (
        <p className="-mt-2 mb-3 text-xs text-muted-foreground">{subtitle}</p>
      )}
      <div className="flex-1">{children}</div>
    </section>
  );
}
