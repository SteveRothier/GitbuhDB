import type { Metadata } from "next";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ExternalLink, GitFork, Star, AlertCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { RepoCharts } from "@/components/repo-charts";
import { RefreshRepoButton } from "@/components/refresh-repo-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitHubApiError } from "@/lib/github";
import { getRepositoryWithHistory } from "@/lib/repositories";

type PageProps = {
  params: Promise<{ owner: string; repo: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  return {
    title: `${owner}/${repo}`,
    description: `Statistiques et évolution de ${owner}/${repo} sur GitHub`,
  };
}

function StatItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/50 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-xl font-semibold tabular-nums">
        {icon}
        {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
      </p>
    </div>
  );
}

export default async function RepositoryPage({ params }: PageProps) {
  const { owner, repo: repoName } = await params;

  let data;
  try {
    data = await getRepositoryWithHistory(owner, repoName);
  } catch (err) {
    if (err instanceof GitHubApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const { repo, history } = data;
  const githubUrl = `https://github.com/${repo.owner}/${repo.name}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{repo.full_name}</h1>
            {repo.language && <Badge>{repo.language}</Badge>}
          </div>
          {repo.description && (
            <p className="max-w-2xl text-muted-foreground">{repo.description}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-primary"
            >
              Voir sur GitHub
              <ExternalLink className="size-3.5" />
            </a>
            {repo.last_synced_at && (
              <span>
                Dernière sync :{" "}
                {format(new Date(repo.last_synced_at), "d MMM yyyy HH:mm", {
                  locale: fr,
                })}
              </span>
            )}
          </div>
        </div>
        <RefreshRepoButton owner={repo.owner} name={repo.name} />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatItem
          label="Stars"
          value={repo.stars}
          icon={<Star className="size-4 fill-amber-400 text-amber-400" />}
        />
        <StatItem
          label="Forks"
          value={repo.forks}
          icon={<GitFork className="size-4" />}
        />
        <StatItem
          label="Issues ouvertes"
          value={repo.open_issues}
          icon={<AlertCircle className="size-4" />}
        />
        <StatItem label="Watchers" value={repo.watchers} />
      </div>

      {repo.created_at && (
        <Card className="mb-8 border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Informations</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <p>
              Créé le{" "}
              {format(new Date(repo.created_at), "d MMMM yyyy", { locale: fr })}
            </p>
            {repo.updated_at && (
              <p>
                Mis à jour sur GitHub le{" "}
                {format(new Date(repo.updated_at), "d MMMM yyyy", {
                  locale: fr,
                })}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <RepoCharts history={history} />
    </div>
  );
}
