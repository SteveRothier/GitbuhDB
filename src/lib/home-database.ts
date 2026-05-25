import { unstable_cache } from "next/cache";
import { searchRepositories } from "@/lib/github";
import type { GitHubSearchItem, HomeDatabaseLists, HomeRepoRow } from "@/lib/types";

const TOP_STARS_LIMIT = 15;
const TOP_CREATED_LIMIT = 15;

const TOP_STARS_MIN = 10_000;
const NEW_MIN_STARS = 500;
const NEW_DAYS = 30;

function utcYmdDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function mapSearchItem(item: GitHubSearchItem, index: number): HomeRepoRow {
  const [owner, name] = item.full_name.split("/");
  return {
    id: item.id ?? index,
    owner: owner ?? item.owner.login,
    name: name ?? item.name,
    fullName: item.full_name,
    description: item.description,
    language: item.language,
    stars: item.stargazers_count ?? 0,
    forks: item.forks_count ?? 0,
    pushedAt: item.pushed_at ?? null,
    createdAt: item.created_at ?? null,
  };
}

async function fetchHomeDatabaseListsUncached(): Promise<HomeDatabaseLists> {
  const hasToken = Boolean(process.env.GITHUB_TOKEN?.trim());
  const empty: HomeDatabaseLists = {
    topStars: [],
    topCreated30d: [],
    fetchedAt: new Date().toISOString(),
    hasToken,
  };

  if (!hasToken) return empty;

  const createdSince30 = utcYmdDaysAgo(NEW_DAYS);

  try {
    const [topItems, topCreatedItems] = await Promise.all([
      searchRepositories(`stars:>${TOP_STARS_MIN}`, {
        perPage: TOP_STARS_LIMIT,
        sort: "stars",
        order: "desc",
      }),
      searchRepositories(`stars:>${NEW_MIN_STARS} created:>=${createdSince30}`, {
        perPage: TOP_CREATED_LIMIT,
        sort: "stars",
        order: "desc",
      }),
    ]);

    return {
      topStars: topItems.map(mapSearchItem),
      topCreated30d: topCreatedItems.map(mapSearchItem),
      fetchedAt: new Date().toISOString(),
      hasToken: true,
    };
  } catch (e) {
    console.error("fetchHomeDatabaseLists:", e);
    return empty;
  }
}

export function getHomeDatabaseListsCached(): Promise<HomeDatabaseLists> {
  return unstable_cache(fetchHomeDatabaseListsUncached, ["home-database-v5"], {
    revalidate: 3600,
  })();
}
