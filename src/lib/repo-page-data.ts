import { fetchRepo } from "@/lib/github";
import type { GitHubRepoResponse, Repository } from "@/lib/types";

export function mapGithubToRepository(data: GitHubRepoResponse): Repository {
  return {
    id: data.id,
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

export async function getRepositoryFromGitHub(
  owner: string,
  name: string,
): Promise<Repository> {
  const data = await fetchRepo(owner, name);
  return mapGithubToRepository(data);
}
