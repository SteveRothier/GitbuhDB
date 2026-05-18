import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { HomeRepoDisplay, LanguageStat, Repository } from "@/lib/types";

type TrendingDailyRow = {
  id: number;
  owner: string;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stars: number;
  stars_gain: number;
};

type GrowthWeeklyRow = {
  id: number;
  owner: string;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stars: number;
  growth_percent: number;
};

type LanguageRow = {
  language: string;
  total: number;
};

function mapTrendingRow(row: TrendingDailyRow): HomeRepoDisplay {
  return {
    id: row.id,
    owner: row.owner,
    name: row.name,
    full_name: row.full_name,
    description: row.description,
    language: row.language,
    stars: row.stars,
    growth: row.stars_gain,
  };
}

function mapGrowthRow(row: GrowthWeeklyRow): HomeRepoDisplay {
  return {
    id: row.id,
    owner: row.owner,
    name: row.name,
    full_name: row.full_name,
    description: row.description,
    language: row.language,
    stars: row.stars,
    growthPercent: Number(row.growth_percent),
  };
}

function mapLanguageRows(rows: LanguageRow[], limit = 6): LanguageStat[] {
  if (!rows.length) return [];

  const total = rows.reduce((sum, row) => sum + Number(row.total), 0);
  if (total === 0) return [];

  const top = rows.slice(0, limit - 1);
  const topCount = top.reduce((sum, row) => sum + Number(row.total), 0);
  const othersCount = total - topCount;

  const stats: LanguageStat[] = top.map((row) => ({
    language: row.language,
    count: Number(row.total),
    percent: (Number(row.total) / total) * 100,
  }));

  if (othersCount > 0 && rows.length > top.length) {
    stats.push({
      language: "Autres",
      count: othersCount,
      percent: (othersCount / total) * 100,
    });
  }

  return stats;
}

export async function getTrendingDailyFromDb(
  limit = 5,
): Promise<HomeRepoDisplay[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_trending_daily", {
    p_limit: limit,
  });

  if (error) {
    console.error("get_trending_daily:", error.message);
    return [];
  }

  return ((data as TrendingDailyRow[]) ?? []).map(mapTrendingRow);
}

export async function getGrowthWeeklyFromDb(
  limit = 5,
): Promise<HomeRepoDisplay[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_growth_weekly", {
    p_limit: limit,
  });

  if (error) {
    console.error("get_growth_weekly:", error.message);
    return [];
  }

  return ((data as GrowthWeeklyRow[]) ?? []).map(mapGrowthRow);
}

export async function getLatestReposFromDb(
  limit = 5,
): Promise<Repository[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("repositories")
    .select("*")
    .order("last_synced_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error("getLatestReposFromDb:", error.message);
    return [];
  }

  return (data as Repository[]) ?? [];
}

export async function getLanguagesFromDb(limit = 6): Promise<LanguageStat[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_popular_languages", {
    p_limit: 100,
  });

  if (error) {
    console.error("get_popular_languages:", error.message);
    return [];
  }

  return mapLanguageRows((data as LanguageRow[]) ?? [], limit);
}

export async function getHomeDataFromDb() {
  const [trending, growth, latest, languages] = await Promise.all([
    getTrendingDailyFromDb(5),
    getGrowthWeeklyFromDb(5),
    getLatestReposFromDb(5),
    getLanguagesFromDb(6),
  ]);

  return { trending, growth, latest, languages };
}
