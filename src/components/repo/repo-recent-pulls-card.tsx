import Link from "next/link";
import { formatDistanceStrict } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare } from "lucide-react";
import {
  RECENT_LIST_LIMIT,
  REPO_CARD,
  REPO_PANEL_BODY,
} from "@/components/repo/repo-panel-layout";
import type { RecentPull } from "@/lib/types";

function formatRelativeAgo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return formatDistanceStrict(d, new Date(), { locale: fr, addSuffix: true });
}

function PullStateBadge({ pull }: { pull: RecentPull }) {
  if (pull.draft) {
    return (
      <span className="grid h-5 w-[52px] shrink-0 place-items-center rounded-sm bg-zinc-500/20 text-[10px] font-medium leading-none text-zinc-400">
        DRAFT
      </span>
    );
  }
  if (pull.state === "open") {
    return (
      <span className="grid h-5 w-[52px] shrink-0 place-items-center rounded-sm bg-emerald-500/15 text-[10px] font-medium leading-none text-emerald-300">
        OPEN
      </span>
    );
  }
  return (
    <span className="grid h-5 w-[52px] shrink-0 place-items-center rounded-sm bg-violet-500/15 text-[10px] font-medium leading-none text-violet-300">
      CLOSED
    </span>
  );
}

export function RepoRecentPullsCard({
  pulls,
  pullsUrl,
}: {
  pulls: RecentPull[];
  pullsUrl: string;
}) {
  const items = pulls.slice(0, RECENT_LIST_LIMIT);

  return (
    <div className={REPO_CARD} aria-label="Pull requests récentes">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <h3 className="text-sm font-medium text-zinc-200">Pull requests récentes</h3>
        <a
          href={pullsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          Voir toutes les PR
        </a>
      </div>

      <div className={REPO_PANEL_BODY}>
        {items.length === 0 ? (
          <p className="flex flex-1 items-center justify-center px-4 text-sm text-zinc-400">
            Aucune pull request récente.
          </p>
        ) : (
          <ul className="flex min-h-0 flex-1 flex-col">
            {items.map((pull, index) => (
              <li
                key={pull.number}
                className={`flex min-h-0 flex-1 ${index < items.length - 1 ? "border-b border-white/[0.06]" : ""}`}
              >
                <Link
                  href={pull.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full min-w-0 flex-col justify-center px-3 py-2 transition-colors hover:bg-white/[0.03] sm:px-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                      <PullStateBadge pull={pull} />
                      <span className="shrink-0 text-[10px] text-zinc-500 sm:text-xs">
                        #{pull.number}
                      </span>
                      <span className="min-w-0 truncate text-xs font-medium text-zinc-100 sm:text-sm">
                        {pull.title}
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] text-zinc-500 sm:text-xs">
                      {formatRelativeAgo(pull.updatedAt)}
                    </span>
                  </div>
                  {pull.comments > 0 && (
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] leading-snug text-zinc-500 sm:text-xs">
                      <MessageSquare className="size-3 shrink-0" aria-hidden />
                      {pull.comments} commentaire{pull.comments > 1 ? "s" : ""}
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
