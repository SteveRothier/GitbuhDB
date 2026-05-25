import type { ReactNode } from "react";
import { format, formatDistanceStrict } from "date-fns";
import { fr } from "date-fns/locale";
import { Info } from "lucide-react";
import Link from "next/link";
import { REPO_CARD } from "@/components/repo/repo-panel-layout";
import { formatExact } from "@/lib/format";
import type { RepoPageExtras } from "@/lib/types";

const languageDot: Record<string, string> = {
  TypeScript: "bg-sky-400",
  JavaScript: "bg-amber-400",
  Rust: "bg-orange-400",
  Python: "bg-emerald-400",
  Go: "bg-cyan-400",
};

function formatSize(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1).replace(/\.0$/, "")} MB`;
  return `${kb} KB`;
}

function formatRelativeAgo(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return formatDistanceStrict(d, new Date(), { locale: fr, addSuffix: true });
}

function DetailCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <div className="mt-1 text-sm font-medium text-zinc-200">{children}</div>
    </div>
  );
}

export function RepoDetailsCard({
  language,
  extras,
}: {
  language: string | null;
  extras: RepoPageExtras;
}) {
  const pushedLabel = formatRelativeAgo(extras.pushedAt);
  const updatedLabel = extras.updatedAt
    ? format(new Date(extras.updatedAt), "d MMM yyyy", { locale: fr })
    : "—";

  const dotClass = language ? (languageDot[language] ?? "bg-violet-400") : "bg-zinc-500";

  return (
    <div className={REPO_CARD}>
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <Info className="size-4 shrink-0 text-zinc-500" aria-hidden />
        <h3 className="text-sm font-medium text-zinc-200">Détails du dépôt</h3>
      </div>

      <div className="grid flex-1 grid-cols-2 content-center gap-x-4 gap-y-3 px-4 py-4">
        <DetailCell label="Langage principal">
          <span className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${dotClass}`} aria-hidden />
            {language ?? "—"}
          </span>
        </DetailCell>
        <DetailCell label="Taille du repo">{formatSize(extras.sizeKb)}</DetailCell>
        <DetailCell label="Dernier push">{pushedLabel}</DetailCell>
        <DetailCell label="Dernière MAJ repo">{updatedLabel}</DetailCell>
        <DetailCell label="Commits (total)">
          {extras.totalCommits != null ? formatExact(extras.totalCommits) : "—"}
        </DetailCell>
        <DetailCell label="Branche par défaut">
          <code className="rounded-md bg-white/[0.06] px-2 py-0.5 text-sm font-medium text-zinc-200">
            {extras.defaultBranch}
          </code>
        </DetailCell>
        <DetailCell label="Dernière release">
          {extras.latestRelease ? (
            <Link
              href={extras.latestRelease.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-300 hover:text-violet-200"
            >
              {extras.latestRelease.tagName}
            </Link>
          ) : (
            "—"
          )}
        </DetailCell>
      </div>
    </div>
  );
}
