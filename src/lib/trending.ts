import { createClient } from "@/lib/supabase/server";
import type { RepositoryHistory, TrendingPeriod, TrendingRepo } from "@/lib/types";
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

export async function getTrendingRepos(
  period: TrendingPeriod,
  limit = 20,
  filters: TrendingFilters = {},
): Promise<TrendingRepo[]> {
  const supabase = createClient();
  const windowStart = subDays(new Date(), PERIOD_DAYS[period]);

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

  if (!repos?.length) return [];

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

  const trending: TrendingRepo[] = [];

  for (const repo of repos) {
    const history = historyByRepo.get(repo.id) ?? [];
    if (history.length < 2) continue;

    const latest = history[history.length - 1];
    const baseline = findHistoryAtOrBefore(history, windowStart);

    if (!baseline || baseline.id === latest.id) continue;

    const growth = latest.stars - baseline.stars;
    if (growth <= 0) continue;

    trending.push({
      id: repo.id,
      owner: repo.owner,
      name: repo.name,
      full_name: repo.full_name,
      language: repo.language,
      stars: latest.stars,
      growth,
    });
  }

  trending.sort((a, b) => b.growth - a.growth);
  return trending.slice(0, limit);
}
