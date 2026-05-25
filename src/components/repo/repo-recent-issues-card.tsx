import Link from "next/link";
import { formatDistanceStrict } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare } from "lucide-react";
import {
  RECENT_LIST_LIMIT,
  REPO_CARD,
  REPO_PANEL_BODY,
} from "@/components/repo/repo-panel-layout";
import type { RecentIssue } from "@/lib/types";

function formatRelativeAgo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return formatDistanceStrict(d, new Date(), { locale: fr, addSuffix: true });
}

function IssueStateBadge({ state }: { state: "open" | "closed" }) {
  const isOpen = state === "open";
  return (
    <span
      className={
        isOpen
          ? "grid h-5 w-[52px] shrink-0 place-items-center rounded-sm bg-rose-500/15 text-[10px] font-medium leading-none text-rose-300"
          : "grid h-5 w-[52px] shrink-0 place-items-center rounded-sm bg-emerald-500/15 text-[10px] font-medium leading-none text-emerald-300"
      }
    >
      {isOpen ? "OPEN" : "CLOSED"}
    </span>
  );
}

export function RepoRecentIssuesCard({
  issues,
  issuesUrl,
}: {
  issues: RecentIssue[];
  issuesUrl: string;
}) {
  const items = issues.slice(0, RECENT_LIST_LIMIT);

  return (
    <div className={REPO_CARD} aria-label="Issues les plus récentes">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <h3 className="text-sm font-medium text-zinc-200">Issues les plus récentes</h3>
        <a
          href={issuesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          Voir toutes les issues
        </a>
      </div>

      <div className={REPO_PANEL_BODY}>
        {items.length === 0 ? (
          <p className="flex flex-1 items-center justify-center px-4 text-sm text-zinc-400">
            Aucune issue récente.
          </p>
        ) : (
          <ul className="flex min-h-0 flex-1 flex-col">
            {items.map((issue, index) => (
              <li
                key={issue.number}
                className={`flex min-h-0 flex-1 ${index < items.length - 1 ? "border-b border-white/[0.06]" : ""}`}
              >
                <Link
                  href={issue.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full min-w-0 flex-col justify-center px-3 py-2 transition-colors hover:bg-white/[0.03] sm:px-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                      <IssueStateBadge state={issue.state} />
                      <span className="shrink-0 text-[10px] text-zinc-500 sm:text-xs">
                        #{issue.number}
                      </span>
                      <span className="min-w-0 truncate text-xs font-medium text-zinc-100 sm:text-sm">
                        {issue.title}
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] text-zinc-500 sm:text-xs">
                      {formatRelativeAgo(issue.updatedAt)}
                    </span>
                  </div>
                  {issue.comments > 0 && (
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] leading-snug text-zinc-500 sm:text-xs">
                      <MessageSquare className="size-3 shrink-0" aria-hidden />
                      {issue.comments} commentaire{issue.comments > 1 ? "s" : ""}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
