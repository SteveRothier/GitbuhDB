import { searchPopularRepos } from "@/lib/github";
import { syncRepository } from "@/lib/repositories";
import { createAdminClient } from "@/lib/supabase/admin";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDiscoverConfig() {
  const minStars = Number(process.env.DISCOVER_MIN_STARS ?? "10000");
  const maxNew = Number(process.env.DISCOVER_MAX_NEW_PER_RUN ?? "15");
  const searchLimit = Number(process.env.DISCOVER_SEARCH_LIMIT ?? "30");

  return {
    minStars: Number.isNaN(minStars) ? 10000 : minStars,
    maxNewToIndex: Number.isNaN(maxNew) ? 15 : maxNew,
    searchLimit: Number.isNaN(searchLimit) ? 30 : Math.min(searchLimit, 100),
  };
}

export type DiscoverResult = {
  searched: number;
  alreadyIndexed: number;
  indexed: number;
  failed: number;
  indexedRepos: string[];
  errors: string[];
};

export async function discoverAndIndexPopularRepos(options?: {
  minStars?: number;
  searchLimit?: number;
  maxNewToIndex?: number;
}): Promise<DiscoverResult> {
  const defaults = getDiscoverConfig();
  const minStars = options?.minStars ?? defaults.minStars;
  const searchLimit = options?.searchLimit ?? defaults.searchLimit;
  const maxNewToIndex = options?.maxNewToIndex ?? defaults.maxNewToIndex;

  const supabase = createAdminClient();
  const { data: existing } = await supabase.from("repositories").select("github_id");

  const existingIds = new Set((existing ?? []).map((r) => r.github_id));

  const candidates = await searchPopularRepos(searchLimit, minStars);

  const newRepos = candidates.filter((item) => !existingIds.has(item.id));
  const alreadyIndexed = candidates.length - newRepos.length;

  const toIndex = newRepos.slice(0, maxNewToIndex);
  const indexedRepos: string[] = [];
  const errors: string[] = [];
  let indexed = 0;
  let failed = 0;

  for (const item of toIndex) {
    const [owner, name] = item.full_name.split("/");
    if (!owner || !name) continue;

    try {
      await syncRepository(owner, name);
      indexed++;
      indexedRepos.push(item.full_name);
    } catch (err) {
      failed++;
      errors.push(
        `${item.full_name}: ${err instanceof Error ? err.message : "erreur"}`,
      );
    }

    await sleep(500);
  }

  return {
    searched: candidates.length,
    alreadyIndexed,
    indexed,
    failed,
    indexedRepos,
    errors: errors.slice(0, 10),
  };
}
