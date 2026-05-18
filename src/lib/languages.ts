import { createClient } from "@/lib/supabase/server";
import type { LanguageStat } from "@/lib/types";

export async function getPopularLanguages(limit = 6): Promise<LanguageStat[]> {
  const supabase = createClient();
  const { data: repos } = await supabase
    .from("repositories")
    .select("language")
    .not("language", "is", null);

  if (!repos?.length) return [];

  const counts = new Map<string, number>();
  for (const row of repos) {
    if (!row.language) continue;
    counts.set(row.language, (counts.get(row.language) ?? 0) + 1);
  }

  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([language, count]) => ({ language, count }));

  const total = sorted.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return [];

  const top = sorted.slice(0, limit - 1);
  const topCount = top.reduce((sum, item) => sum + item.count, 0);
  const othersCount = total - topCount;

  const stats: LanguageStat[] = top.map(({ language, count }) => ({
    language,
    count,
    percent: (count / total) * 100,
  }));

  if (othersCount > 0 && sorted.length > top.length) {
    stats.push({
      language: "Autres",
      count: othersCount,
      percent: (othersCount / total) * 100,
    });
  }

  return stats;
}

export function aggregateLanguagesFromRepos(
  repos: { language: string | null }[],
  limit = 6,
): LanguageStat[] {
  const counts = new Map<string, number>();
  for (const repo of repos) {
    if (!repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }

  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([language, count]) => ({ language, count }));

  const total = sorted.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return [];

  const top = sorted.slice(0, limit - 1);
  const topCount = top.reduce((sum, item) => sum + item.count, 0);
  const othersCount = total - topCount;

  const stats: LanguageStat[] = top.map(({ language, count }) => ({
    language,
    count,
    percent: (count / total) * 100,
  }));

  if (othersCount > 0 && sorted.length > top.length) {
    stats.push({
      language: "Autres",
      count: othersCount,
      percent: (othersCount / total) * 100,
    });
  }

  return stats;
}
