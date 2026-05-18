import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TrendingRepo } from "@/lib/types";

type TrendingTableProps = {
  repos: TrendingRepo[];
  emptyMessage?: string;
};

export function TrendingTable({
  repos,
  emptyMessage = "Pas encore assez de données historiques. Visitez ou synchronisez des repositories pour alimenter le classement.",
}: TrendingTableProps) {
  if (repos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30 text-left text-muted-foreground">
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Repository</th>
            <th className="px-4 py-3 font-medium">Langage</th>
            <th className="px-4 py-3 font-medium text-right">Stars</th>
            <th className="px-4 py-3 font-medium text-right">Croissance</th>
          </tr>
        </thead>
        <tbody>
          {repos.map((repo, index) => (
            <tr
              key={repo.id}
              className="border-b border-border/40 last:border-0 hover:bg-muted/20"
            >
              <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/github/${repo.owner}/${repo.name}`}
                  className="font-medium hover:text-primary"
                >
                  {repo.full_name}
                </Link>
              </td>
              <td className="px-4 py-3">
                {repo.language ? (
                  <Badge variant="secondary">{repo.language}</Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {repo.stars.toLocaleString("fr-FR")}
              </td>
              <td className="px-4 py-3 text-right">
                <span className="inline-flex items-center gap-1 font-medium text-emerald-400">
                  <TrendingUp className="size-3.5" />+{repo.growth.toLocaleString("fr-FR")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
