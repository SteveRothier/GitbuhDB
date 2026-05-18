import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { TrendingPeriod } from "@/lib/types";

const PERIODS: { value: TrendingPeriod; label: string }[] = [
  { value: "daily", label: "Aujourd'hui" },
  { value: "weekly", label: "Semaine" },
  { value: "monthly", label: "Mois" },
];

export function TrendingPeriodNav({
  current,
  language,
  minStars,
}: {
  current: TrendingPeriod;
  language?: string;
  minStars?: string;
}) {
  function href(period: TrendingPeriod) {
    const params = new URLSearchParams({ period });
    if (language) params.set("language", language);
    if (minStars) params.set("minStars", minStars);
    return `/trending?${params.toString()}`;
  }

  return (
    <nav className="flex flex-wrap gap-2">
      {PERIODS.map((p) => (
        <Link
          key={p.value}
          href={href(p.value)}
          className={cn(
            buttonVariants({
              variant: current === p.value ? "default" : "outline",
              size: "sm",
            }),
          )}
        >
          {p.label}
        </Link>
      ))}
    </nav>
  );
}
