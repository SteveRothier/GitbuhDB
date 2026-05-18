import { createClient } from "@/lib/supabase/server";
import type {
  Repository,
  RepositoryHistory,
  TrendingPeriod,
  TrendingRepo,
} from "@/lib/types";
import { subDays } from "date-fns";

const PERIOD_DAYS: Record<TrendingPeriod, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};

export type TrendingFilters = {
  language?: string;
  minStars?: number;
  createdAfter?: string;
};

function findHistoryAtOrBefore(
  history: RepositoryHistory[],
  target: Date,
): RepositoryHistory | null {
  const targetMs = target.getTime();
  let best: RepositoryHistory | null = null;

  for (const entry of history) {
    const ms = new Date(entry.collected_at).getTime();
    if (ms <= targetMs) {
      best = entry;
    }
  }

  return best;
}

function computeTrending(
  repos: Repository[],
  historyByRepo: Map<number, RepositoryHistory[]>,
  windowStart: Date,
  sortByPercent = false,
): TrendingRepo[] {
  const trending: TrendingRepo[] = [];

  for (const repo of repos) {
    const history = historyByRepo.get(repo.id) ?? [];
    if (history.length < 2) continue;

    const latest = history[history.length - 1];
    const baseline = findHistoryAtOrBefore(history, windowStart);

    if (!baseline || baseline.id === latest.id) continue;

    const growth = latest.stars - baseline.stars;
    if (growth <= 0) continue;

    const growthPercent =
      baseline.stars > 0 ? (growth / baseline.stars) * 100 : 0;

    trending.push({
      id: repo.id,
      owner: repo.owner,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: latest.stars,
      growth,
      growthPercent,
    });
  }

  if (sortByPercent) {
    trending.sort((a, b) => (b.growthPercent ?? 0) - (a.growthPercent ?? 0));
  } else {
    trending.sort((a, b) => b.growth - a.growth);
  }

  return trending;
}

async function loadReposWithHistory(filters: TrendingFilters = {}) {
  const supabase = createClient();

  let query = supabase.from("repositories").select("*");

  if (filters.language) {
    query = query.eq("language", filters.language);
  }
  if (filters.minStars != null) {
    query = query.gte("stars", filters.minStars);
  }
  if (filters.createdAfter) {
    query = query.gte("created_at", filters.createdAfter);
  }

  const { data: repos } = await query;

  if (!repos?.length) return { repos: [] as Repository[], historyByRepo: new Map() };

  const repoIds = repos.map((r) => r.id);
  const { data: allHistory } = await supabase
    .from("repository_history")
    .select("*")
    .in("repository_id", repoIds)
    .order("collected_at", { ascending: true });

  const historyByRepo = new Map<number, RepositoryHistory[]>();
  for (const entry of allHistory ?? []) {
    const list = historyByRepo.get(entry.repository_id) ?? [];
    list.push(entry as RepositoryHistory);
    historyByRepo.set(entry.repository_id, list);
  }

  return { repos: repos as Repository[], historyByRepo };
}

export async function getTrendingRepos(
  period: TrendingPeriod,
  limit = 20,
  filters: TrendingFilters = {},
): Promise<TrendingRepo[]> {
  const windowStart = subDays(new Date(), PERIOD_DAYS[period]);
  const { repos, historyByRepo } = await loadReposWithHistory(filters);
  return computeTrending(repos, historyByRepo, windowStart, false).slice(0, limit);
}

export async function getTopGrowthRepos(limit = 5): Promise<TrendingRepo[]> {
  const windowStart = subDays(new Date(), PERIOD_DAYS.weekly);
  const { repos, historyByRepo } = await loadReposWithHistory();
  return computeTrending(repos, historyByRepo, windowStart, true).slice(0, limit);
}
