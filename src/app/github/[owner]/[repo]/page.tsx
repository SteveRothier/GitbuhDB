import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  ChevronRight,
  ExternalLink,
  Globe,
  Home,
  Scale,
} from "lucide-react";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RepoChartsSection } from "@/components/repo/repo-charts-section";
import { RepoChartsSkeleton } from "@/components/repo/repo-charts-skeleton";
import { RepoHeaderBadges } from "@/components/repo/repo-header-badges";
import { RepoStatGrid } from "@/components/repo/repo-stat-grid";
import { RepoPageRefreshButton } from "@/components/repo/repo-page-refresh-button";
import { RepoTopContributors } from "@/components/repo/repo-top-contributors";
import { fetchRepo, GitHubApiError } from "@/lib/github";
import { enrichRepoPageExtras } from "@/lib/repo-page-enrichment";
import { mapGithubToRepository } from "@/lib/repo-page-data";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ owner: string; repo: string }>;
};

const TOPIC_CLASS: Record<string, string> = {
  typescript: "bg-sky-500/15 text-sky-200",
  react: "bg-emerald-500/15 text-emerald-200",
  "next.js": "bg-zinc-500/20 text-zinc-200",
  nextjs: "bg-zinc-500/20 text-zinc-200",
  rust: "bg-orange-500/15 text-orange-200",
  ai: "bg-violet-500/15 text-violet-200",
};

function topicClass(topic: string) {
  return TOPIC_CLASS[topic.toLowerCase()] ?? "bg-white/5 text-zinc-300";
}

function chipKey(value: string): string {
  return value.toLowerCase().replace(/[\s_]+/g, "-");
}

/** Langage principal + topics GitHub, sans doublon (insensible à la casse). */
function buildHeaderChips(language: string | null, topics: string[], max = 6): string[] {
  const seen = new Set<string>();
  const chips: string[] = [];

  const add = (label: string) => {
    const key = chipKey(label);
    if (!key || seen.has(key)) return;
    seen.add(key);
    chips.push(label);
  };

  if (language) add(language);
  for (const topic of topics) {
    if (chips.length >= max) break;
    add(topic);
  }

  return chips;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  return {
    title: `${owner}/${repo}`,
    description: `Statistiques et activité de ${owner}/${repo} sur GitHub`,
  };
}

export default async function RepositoryPage({ params }: PageProps) {
  const { owner, repo: repoName } = await params;

  let github;
  try {
    github = await fetchRepo(owner, repoName);
  } catch (err) {
    if (err instanceof GitHubApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const repo = mapGithubToRepository(github);
  const { extras, contributors } = await enrichRepoPageExtras(owner, repoName, github);

  const githubUrl = `https://github.com/${repo.owner}/${repo.name}`;
  const headerChips = buildHeaderChips(repo.language, extras.topics);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <nav
          className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm text-zinc-500"
          aria-label="Fil d'Ariane"
        >
          <Link href="/" className="inline-flex items-center gap-1 hover:text-zinc-300">
            <Home className="size-4" aria-hidden />
            <span className="sr-only">Accueil</span>
          </Link>
          <ChevronRight className="size-4 shrink-0 opacity-40" aria-hidden />
          <span className="text-zinc-600">github</span>
          <ChevronRight className="size-4 shrink-0 opacity-40" aria-hidden />
          <span className="text-zinc-400">{repo.owner}</span>
          <ChevronRight className="size-4 shrink-0 opacity-40" aria-hidden />
          <span className="font-medium text-zinc-200">{repo.name}</span>
        </nav>
        <RepoPageRefreshButton owner={owner} repo={repoName} />
      </div>

      <header className="mb-6 rounded-xl border border-white/[0.06] bg-[#161b22] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-black/40 sm:size-[72px]">
              <Image
                src={extras.avatarUrl}
                alt=""
                width={72}
                height={72}
                className="size-full object-cover"
                priority
                loading="eager"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                <span className="text-zinc-400">{repo.owner}</span>
                <span className="text-zinc-600">/</span>
                <span>{repo.name}</span>
              </h1>
              <RepoHeaderBadges extras={extras} />
              {repo.description && (
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
                  {repo.description}
                </p>
              )}
              {headerChips.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {headerChips.map((label) => (
                    <span
                      key={chipKey(label)}
                      className={cn(
                        "rounded-sm px-2.5 py-0.5 text-xs font-medium capitalize",
                        topicClass(label),
                      )}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                {extras.homepage && (
                  <a
                    href={
                      extras.homepage.startsWith("http")
                        ? extras.homepage
                        : `https://${extras.homepage}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-zinc-300"
                  >
                    <Globe className="size-3.5" aria-hidden />
                    {extras.homepage.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {extras.license && (
                  <span className="inline-flex items-center gap-1.5">
                    <Scale className="size-3.5" aria-hidden />
                    {extras.license}
                  </span>
                )}
                {repo.created_at && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5" aria-hidden />
                    Créé le {format(new Date(repo.created_at), "d MMM yyyy", { locale: fr })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:items-end">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500/15"
            >
              Voir sur GitHub
              <ExternalLink className="size-4 opacity-80" />
            </a>
          </div>
        </div>
      </header>

      <RepoStatGrid
        stars={repo.stars}
        forks={repo.forks}
        watchers={repo.watchers}
        openIssues={repo.open_issues}
        contributors={contributors.count}
      />

      <RepoTopContributors top={contributors.top} />

      <div className="mt-6">
        <Suspense fallback={<RepoChartsSkeleton />}>
          <RepoChartsSection
            owner={owner}
            repoName={repoName}
            language={repo.language}
            extras={extras}
          />
        </Suspense>
      </div>
    </div>
  );
}
