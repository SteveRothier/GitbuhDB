import Link from "next/link";
import { RepoAvatar } from "@/components/home/repo-avatar";

type RepoListItemProps = {
  rank?: number;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  language?: string | null;
  trailing: React.ReactNode;
};

export function RepoListItem({
  rank,
  owner,
  name,
  fullName,
  description,
  language,
  trailing,
}: RepoListItemProps) {
  return (
    <li className="flex items-center gap-3 border-b border-border/30 py-3.5 last:border-0">
      {rank != null && (
        <span className="w-4 shrink-0 text-center text-sm font-medium text-muted-foreground">
          {rank}
        </span>
      )}
      <RepoAvatar owner={owner} language={language ?? null} />
      <div className="min-w-0 flex-1">
        <Link
          href={`/github/${owner}/${name}`}
          className="text-sm font-semibold hover:text-primary"
        >
          {fullName}
        </Link>
        {description && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{trailing}</div>
    </li>
  );
}
