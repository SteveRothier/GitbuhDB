import { TrendingUp } from "lucide-react";
import type { HomeRepoDisplay } from "@/lib/types";
import { formatCompact, formatGrowthPercent } from "@/lib/format";
import { RepoListItem } from "@/components/home/repo-list-item";

type GrowthListProps = {
  repos: HomeRepoDisplay[];
  usingFallback?: boolean;
};

export function GrowthList({ repos, usingFallback }: GrowthListProps) {
  if (repos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Pas encore de données de croissance sur 7 jours.
      </p>
    );
  }

  return (
    <ul>
      {repos.map((repo, index) => (
        <RepoListItem
          key={`${repo.full_name}-${index}`}
          rank={index + 1}
          owner={repo.owner}
          name={repo.name}
          fullName={repo.full_name}
          description={repo.description}
          language={repo.language}
          trailing={
            repo.growthPercent != null && repo.growthPercent > 0 && !usingFallback ? (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400">
                <TrendingUp className="size-3.5" />
                {formatGrowthPercent(repo.growthPercent)}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                {formatCompact(repo.stars)} ★
              </span>
            )
          }
        />
      ))}
      {usingFallback && (
        <p className="mt-3 text-xs text-muted-foreground">
          Basé sur les stars GitHub — historique en cours de collecte.
        </p>
      )}
    </ul>
  );
}
