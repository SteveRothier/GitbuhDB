import { Star } from "lucide-react";
import type { HomeRepoDisplay } from "@/lib/types";
import { formatCompact } from "@/lib/format";
import { RepoListItem } from "@/components/home/repo-list-item";

type TrendingListProps = {
  repos: HomeRepoDisplay[];
  usingFallback?: boolean;
};

export function TrendingList({ repos, usingFallback }: TrendingListProps) {
  if (repos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Visitez un dépôt via la recherche pour commencer l&apos;historique.
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
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400">
              <Star className="size-3.5 fill-emerald-400/30" />
              {repo.growth != null && repo.growth > 0 && !usingFallback
                ? formatCompact(repo.growth)
                : formatCompact(repo.stars)}
            </span>
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
