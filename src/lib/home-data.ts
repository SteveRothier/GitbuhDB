import { searchPopularRepos } from "@/lib/github";
import { getHomeDataFromDb } from "@/lib/home-db";
import { aggregateLanguagesFromRepos } from "@/lib/languages";
import type { HomeRepoDisplay, LanguageStat, Repository } from "@/lib/types";

function githubItemToDisplay(
  item: Awaited<ReturnType<typeof searchPopularRepos>>[number],
  index: number,
): HomeRepoDisplay {
  const [owner, name] = item.full_name.split("/");
  return {
    id: item.id ?? index,
    owner,
    name,
    full_name: item.full_name,
    description: item.description,
    language: item.language,
    stars: item.stargazers_count,
  };
}

export type HomePageData = {
  dailyTrending: HomeRepoDisplay[];
  weeklyGrowth: HomeRepoDisplay[];
  recent: Repository[];
  languages: LanguageStat[];
  usingGitHubFallback: boolean;
};

export async function getHomePageData(): Promise<HomePageData> {
  const db = await getHomeDataFromDb();

  let dailyDisplay = db.trending;
  let growthDisplay = db.growth;
  let languageStats = db.languages;
  let usingGitHubFallback = false;

  if (dailyDisplay.length === 0) {
    try {
      const popular = await searchPopularRepos(5);
      dailyDisplay = popular.map(githubItemToDisplay);
      usingGitHubFallback = dailyDisplay.length > 0;
    } catch {
      // ignore
    }
  }

  if (growthDisplay.length === 0 && !usingGitHubFallback) {
    try {
      const popular = await searchPopularRepos(5);
      growthDisplay = popular.slice(0, 5).map((item, i) => ({
        ...githubItemToDisplay(item, i),
        growthPercent: undefined,
      }));
    } catch {
      // ignore
    }
  } else if (growthDisplay.length === 0 && usingGitHubFallback) {
    growthDisplay = dailyDisplay;
  }

  if (languageStats.length === 0) {
    try {
      const popular = await searchPopularRepos(30);
      languageStats = aggregateLanguagesFromRepos(popular, 6);
    } catch {
      // ignore
    }
  }

  return {
    dailyTrending: dailyDisplay,
    weeklyGrowth: growthDisplay,
    recent: db.latest,
    languages: languageStats,
    usingGitHubFallback,
  };
}
