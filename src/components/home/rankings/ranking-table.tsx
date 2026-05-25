import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { RepoAvatar } from "@/components/home/repo-avatar";
import {
  RANKINGS_LINK_CLASS,
  RANKINGS_TABLE_CELL,
  RANKINGS_TABLE_COL_HEAD,
  RANKINGS_TABLE_EMPTY,
  RANKINGS_TABLE_MUTED,
  RANKINGS_TABLE_ROW,
  RANKINGS_TABLE_TITLE_HEAD,
  RankingsTableCard,
} from "@/components/home/rankings/table-styles";
import { formatCompact } from "@/lib/format";
import type { HomeRepoRow } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatCreatedAt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "d MMM yyyy", { locale: fr });
}

type RankingsTableProps = {
  title: string;
  repos: HomeRepoRow[];
  emptyMessage?: string;
  className?: string;
};

export function RankingsTable({
  title,
  repos,
  emptyMessage = "Aucun dépôt.",
  className,
}: RankingsTableProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <RankingsTableCard>
        {repos.length === 0 ? (
          <>
            <div className="border-b border-white/[0.06] px-4 py-3">
              <h3 className="text-base font-semibold tracking-tight text-white">{title}</h3>
            </div>
            <p className={RANKINGS_TABLE_EMPTY}>{emptyMessage}</p>
          </>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[260px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className={RANKINGS_TABLE_TITLE_HEAD}>{title}</th>
                  <th className={cn(RANKINGS_TABLE_COL_HEAD, "text-right")}>Étoiles</th>
                  <th className={cn(RANKINGS_TABLE_COL_HEAD, "text-right")}>Créé</th>
                </tr>
              </thead>
              <tbody>
                {repos.map((repo) => (
                  <tr key={repo.id} className={RANKINGS_TABLE_ROW}>
                    <td className={cn(RANKINGS_TABLE_CELL, "max-w-[180px]")}>
                      <Link
                        href={`/github/${repo.owner}/${repo.name}`}
                        className={cn("flex min-w-0 items-center gap-2", RANKINGS_LINK_CLASS)}
                      >
                        <RepoAvatar owner={repo.owner} className="size-6 shrink-0" />
                        <span className="truncate">{repo.fullName}</span>
                      </Link>
                    </td>
                    <td
                      className={cn(
                        RANKINGS_TABLE_CELL,
                        RANKINGS_TABLE_MUTED,
                        "text-right tabular-nums",
                      )}
                    >
                      {formatCompact(repo.stars)}
                    </td>
                    <td
                      className={cn(
                        RANKINGS_TABLE_CELL,
                        RANKINGS_TABLE_MUTED,
                        "whitespace-nowrap text-right",
                      )}
                    >
                      {formatCreatedAt(repo.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </RankingsTableCard>
    </div>
  );
}
