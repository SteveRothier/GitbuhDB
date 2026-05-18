import { Suspense } from "react";
import { TrendingTable } from "@/components/trending-table";
import { TrendingFilters } from "@/components/trending-filters";
import { TrendingPeriodNav } from "@/components/trending-period-nav";
import { getTrendingRepos } from "@/lib/trending";
import type { TrendingPeriod } from "@/lib/types";

type PageProps = {
  searchParams: Promise<{
    period?: string;
    language?: string;
    minStars?: string;
  }>;
};

function parsePeriod(value?: string): TrendingPeriod {
  if (value === "weekly" || value === "monthly") return value;
  return "daily";
}

export default async function TrendingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = parsePeriod(params.period);
  const minStars = params.minStars ? Number(params.minStars) : undefined;

  const filters = {
    language: params.language || undefined,
    minStars: minStars && !Number.isNaN(minStars) ? minStars : undefined,
  };

  const repos = await getTrendingRepos(period, 50, filters);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Trending</h1>
        <p className="text-muted-foreground">
          Repositories qui gagnent le plus de stars sur la période sélectionnée.
        </p>
      </div>

      <Suspense fallback={null}>
        <TrendingFilters
          period={period}
          defaultLanguage={params.language}
          defaultMinStars={params.minStars}
        />
      </Suspense>

      <div className="mt-6 mb-6">
        <TrendingPeriodNav
          current={period}
          language={params.language}
          minStars={params.minStars}
        />
      </div>

      <TrendingTable repos={repos} />
    </div>
  );
}
