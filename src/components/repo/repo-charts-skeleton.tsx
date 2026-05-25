import { REPO_CARD } from "@/components/repo/repo-panel-layout";

function ChartSkeletonCard() {
  return (
    <div className={REPO_CARD} aria-hidden>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
        <div className="h-5 w-14 animate-pulse rounded bg-white/5" />
      </div>
      <div className="min-h-[220px] flex-1 animate-pulse bg-white/[0.02]" />
    </div>
  );
}

function DetailsSkeletonCard() {
  return (
    <div className={REPO_CARD} aria-hidden>
      <div className="border-b border-white/[0.06] px-4 py-3">
        <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
      </div>
      <div className="grid flex-1 grid-cols-2 gap-4 px-4 py-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
            <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RepoChartsSkeleton() {
  return (
    <div
      className="grid auto-rows-fr gap-4 sm:grid-cols-2 items-stretch"
      aria-busy="true"
      aria-label="Chargement des graphiques"
    >
      <ChartSkeletonCard />
      <ChartSkeletonCard />
      <ChartSkeletonCard />
      <ChartSkeletonCard />
      <ChartSkeletonCard />
      <ChartSkeletonCard />
      <ChartSkeletonCard />
      <DetailsSkeletonCard />
    </div>
  );
}
