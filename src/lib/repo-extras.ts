import type { GitHubRepoResponse, LanguageShare, LatestRelease, RepoPageExtras } from "@/lib/types";

const HIDDEN_REPO_TOPICS = new Set(["supabase"]);

export function buildRepoPageExtras(
  owner: string,
  repo: string,
  data: GitHubRepoResponse,
  options?: {
    languages?: LanguageShare[];
    latestRelease?: LatestRelease | null;
    openPullRequests?: number | null;
    totalCommits?: number | null;
  },
): RepoPageExtras {
  return {
    topics: (data.topics ?? []).filter((t) => !HIDDEN_REPO_TOPICS.has(t.toLowerCase())),
    homepage: data.homepage ?? null,
    license: data.license?.spdx_id ?? data.license?.name ?? null,
    sizeKb: data.size ?? 0,
    defaultBranch: data.default_branch ?? "main",
    pushedAt: data.pushed_at ?? data.updated_at ?? null,
    updatedAt: data.updated_at,
    avatarUrl:
      data.owner.avatar_url ??
      `https://github.com/${encodeURIComponent(owner)}.png?size=128`,
    fork: data.fork ?? false,
    parentFullName: data.parent?.full_name ?? null,
    visibility: data.visibility ?? null,
    archived: data.archived ?? false,
    disabled: data.disabled ?? false,
    isTemplate: data.is_template ?? false,
    networkCount: data.network_count ?? 0,
    hasWiki: data.has_wiki ?? false,
    hasProjects: data.has_projects ?? false,
    hasDiscussions: data.has_discussions ?? false,
    languages: options?.languages ?? [],
    latestRelease: options?.latestRelease ?? null,
    openPullRequests: options?.openPullRequests ?? null,
    totalCommits: options?.totalCommits ?? null,
  };
}
