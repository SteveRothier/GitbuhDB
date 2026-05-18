import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { Repository } from "@/lib/types";
import { RepoListItem } from "@/components/home/repo-list-item";

type RecentListProps = {
  repos: Repository[];
};

export function RecentList({ repos }: RecentListProps) {
  if (repos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Aucun dépôt indexé pour le moment.
      </p>
    );
  }

  return (
    <ul>
      {repos.map((repo) => (
        <RepoListItem
          key={repo.id}
          owner={repo.owner}
          name={repo.name}
          fullName={repo.full_name}
          description={repo.description}
          language={repo.language}
          trailing={
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {repo.last_synced_at
                ? formatDistanceToNow(new Date(repo.last_synced_at), {
                    addSuffix: true,
                    locale: fr,
                  })
                : "—"}
            </span>
          }
        />
      ))}
    </ul>
  );
}
