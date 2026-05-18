import { fetchRepo, GitHubApiError } from "@/lib/github";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { GitHubRepoResponse, Repository, RepositoryHistory } from "@/lib/types";

const STALE_MS = 60 * 60 * 1000;

function mapGithubToRow(data: GitHubRepoResponse) {
  return {
    github_id: data.id,
    owner: data.owner.login,
    name: data.name,
    full_name: data.full_name,
    description: data.description,
    language: data.language,
    stars: data.stargazers_count,
    forks: data.forks_count,
    watchers: data.subscribers_count,
    open_issues: data.open_issues_count,
    created_at: data.created_at,
    updated_at: data.updated_at,
    last_synced_at: new Date().toISOString(),
  };
}

export function isStale(lastSyncedAt: string | null): boolean {
  if (!lastSyncedAt) return true;
  return Date.now() - new Date(lastSyncedAt).getTime() > STALE_MS;
}

export async function syncRepository(
  owner: string,
  name: string,
): Promise<Repository> {
  const data = await fetchRepo(owner, name);
  const supabase = createAdminClient();
  const row = mapGithubToRow(data);

  const { data: repo, error: upsertError } = await supabase
    .from("repositories")
    .upsert(row, { onConflict: "github_id" })
    .select()
    .single();

  if (upsertError || !repo) {
    throw new Error(upsertError?.message ?? "Échec de l'enregistrement du repository");
  }

  const { error: historyError } = await supabase.from("repository_history").insert({
    repository_id: repo.id,
    stars: data.stargazers_count,
    forks: data.forks_count,
    watchers: data.subscribers_count,
    open_issues: data.open_issues_count,
  });

  if (historyError) {
    throw new Error(historyError.message);
  }

  return repo as Repository;
}

export async function getRepository(
  owner: string,
  name: string,
): Promise<Repository | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("repositories")
    .select("*")
    .eq("owner", owner)
    .eq("name", name)
    .maybeSingle();

  return (data as Repository | null) ?? null;
}

export async function getRepositoryHistory(
  repositoryId: number,
): Promise<RepositoryHistory[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("repository_history")
    .select("*")
    .eq("repository_id", repositoryId)
    .order("collected_at", { ascending: true });

  return (data as RepositoryHistory[]) ?? [];
}

export async function getRepositoryWithHistory(
  owner: string,
  name: string,
  options?: { force?: boolean },
) {
  let repo = await getRepository(owner, name);

  if (!repo || options?.force || isStale(repo.last_synced_at)) {
    try {
      repo = await syncRepository(owner, name);
    } catch (err) {
      if (repo && err instanceof GitHubApiError) {
        // Garde les données en cache si GitHub échoue
      } else {
        throw err;
      }
    }
  }

  if (!repo) {
    throw new GitHubApiError("Repository introuvable", 404);
  }

  const history = await getRepositoryHistory(repo.id);
  return { repo, history };
}

export async function listAllRepositories(): Promise<Repository[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("repositories").select("*");
  return (data as Repository[]) ?? [];
}

export async function getRecentRepositories(limit = 10): Promise<Repository[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("repositories")
    .select("*")
    .order("last_synced_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  return (data as Repository[]) ?? [];
}
