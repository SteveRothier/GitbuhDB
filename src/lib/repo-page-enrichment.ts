import {
  fetchContributors,
  fetchLatestRelease,
  fetchOpenPullCount,
  fetchRepoLanguages,
} from "@/lib/github";
import { buildRepoPageExtras } from "@/lib/repo-extras";
import type { ContributorsResult, GitHubRepoResponse, RepoPageExtras } from "@/lib/types";

export async function enrichRepoPageExtras(
  owner: string,
  repo: string,
  github: GitHubRepoResponse,
): Promise<{ extras: RepoPageExtras; contributors: ContributorsResult }> {
  const [languages, latestRelease, openPullRequests, contributors] = await Promise.all([
    fetchRepoLanguages(owner, repo),
    fetchLatestRelease(owner, repo),
    fetchOpenPullCount(owner, repo),
    fetchContributors(owner, repo),
  ]);

  const extras = buildRepoPageExtras(owner, repo, github, {
    languages,
    latestRelease,
    openPullRequests,
    totalCommits: contributors.totalCommits > 0 ? contributors.totalCommits : null,
  });

  return { extras, contributors };
}
