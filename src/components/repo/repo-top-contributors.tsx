import Image from "next/image";
import Link from "next/link";
import { formatExact } from "@/lib/format";
import type { TopContributor } from "@/lib/types";

const card =
  "mt-3 rounded-xl border border-white/[0.06] bg-[#161b22] px-4 py-4 shadow-none";

function contributionLabel(count: number): string {
  return count === 1 ? "1 contribution" : `${formatExact(count)} contributions`;
}

function ContributorTooltip({ contributor }: { contributor: TopContributor }) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 w-max max-w-[200px] -translate-x-1/2 rounded-[10px] border border-white/[0.08] bg-[#0f1419] px-3 py-2 text-xs opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      <p className="font-medium text-zinc-200">{contributionLabel(contributor.contributions)}</p>
      <span
        className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-[#0f1419]"
        aria-hidden
      />
    </div>
  );
}

export function RepoTopContributors({ top }: { top: TopContributor[] }) {
  if (top.length === 0) return null;

  return (
    <div className={card}>
      <div className="flex items-center gap-3 sm:gap-4">
        <p className="shrink-0 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Top contributeurs
        </p>
        <ul className="flex min-w-0 flex-1 items-center justify-evenly gap-0.5 sm:gap-1">
          {top.map((c) => (
            <li key={c.login} className="flex min-w-0 flex-1 justify-center">
              <Link
                href={c.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex max-w-full items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
              >
                <ContributorTooltip contributor={c} />
                {c.avatarUrl ? (
                  <Image
                    src={c.avatarUrl}
                    alt=""
                    width={28}
                    height={28}
                    className="size-7 shrink-0 rounded-full border border-white/10"
                    unoptimized
                  />
                ) : (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-700 text-[10px] text-zinc-300">
                    ?
                  </span>
                )}
                <span className="hidden max-w-[4.5rem] truncate text-xs font-medium text-zinc-400 group-hover:text-zinc-200 sm:inline">
                  {c.login}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
