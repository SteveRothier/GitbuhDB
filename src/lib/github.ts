import type {
  ContributorsResult,
  GitHubRepoResponse,
  GitHubSearchItem,
  LanguageShare,
  LatestRelease,
  RecentIssue,
  RecentPull,
  RecentRelease,
  TopContributor,
} from "@/lib/types";

const GITHUB_API = "https://api.github.com";
const GITHUB_API_VERSION = "2026-03-10";

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
    "User-Agent": "github-tracker",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

async function githubFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: getHeaders(),
    next: { revalidate: 0 },
  });

  if (res.status === 404) {
    throw new GitHubApiError("Repository introuvable", 404);
  }

  if (res.status === 403) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    throw new GitHubApiError(
      remaining === "0"
        ? "Limite de l'API GitHub atteinte"
        : "Accès refusé par l'API GitHub",
      403,
    );
  }

  if (!res.ok) {
    throw new GitHubApiError(`Erreur GitHub API (${res.status})`, res.status);
  }

  return res.json() as Promise<T>;
}

async function githubFetchOptional<T>(path: string, revalidate = 3600): Promise<T | null> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: getHeaders(),
    next: { revalidate },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

type GitHubPageResult<T> = { data: T; link: string | null };

async function githubFetchPage<T>(path: string): Promise<GitHubPageResult<T> | null> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: getHeaders(),
    next: { revalidate: 0 },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const data = (await res.json()) as T;
  return { data, link: res.headers.get("link") };
}

export const ACTIVITY_MAX_PAGES = 30;
export const ACTIVITY_PER_PAGE = 100;

export type ActivityPaginateResult = { truncated: boolean };

async function paginateUpdatedDesc<T extends { updated_at: string }>(
  owner: string,
  repo: string,
  resource: "issues" | "pulls",
  sinceMs: number,
  onItem: (item: T) => void,
  filterItem?: (item: T) => boolean,
): Promise<ActivityPaginateResult> {
  const base = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${resource}`;
  let page = 1;
  let truncated = false;

  while (page <= ACTIVITY_MAX_PAGES) {
    const params = new URLSearchParams({
      state: "all",
      sort: "updated",
      direction: "desc",
      per_page: String(ACTIVITY_PER_PAGE),
      page: String(page),
    });
    const result = await githubFetchPage<T[]>(`${base}?${params}`);
    if (!result?.data?.length) break;

    for (const item of result.data) {
      if (new Date(item.updated_at).getTime() < sinceMs) continue;
      if (filterItem && !filterItem(item)) continue;
      onItem(item);
    }

    const oldest = new Date(result.data[result.data.length - 1].updated_at).getTime();
    if (oldest < sinceMs) break;

    if (result.data.length < ACTIVITY_PER_PAGE) break;
    page += 1;
  }

  if (page > ACTIVITY_MAX_PAGES) truncated = true;
  return { truncated };
}

function parseLinkLastPage(link: string | null): number | null {
  if (!link) return null;
  const match = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export async function fetchRepo(
  owner: string,
  repo: string,
): Promise<GitHubRepoResponse> {
  return githubFetch<GitHubRepoResponse>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
  );
}

type GitHubContributor = {
  login?: string;
  type?: string;
  avatar_url?: string;
  contributions?: number;
};

function parseLinkNext(link: string | null): string | null {
  if (!link) return null;
  const match = link.match(/<([^>]+)>;\s*rel="next"/);
  return match?.[1] ?? null;
}

type GitHubActor = { type?: string; login?: string | null };

/** Compte GitHub Bot ou login se terminant par [bot] / -bot. */
export function isGitHubBot(actor: GitHubActor | null | undefined): boolean {
  if (!actor) return false;
  if (actor.type === "Bot") return true;
  const login = actor.login?.toLowerCase() ?? "";
  return login.endsWith("[bot]") || login.endsWith("-bot");
}

export function isBotContributor(c: GitHubContributor): boolean {
  return isGitHubBot(c);
}

const TOP_CONTRIBUTORS_LIMIT = 5;

/** Contributeurs humains (count + top 5), une seule pagination. */
export async function fetchContributors(
  owner: string,
  repo: string,
): Promise<ContributorsResult> {
  const empty: ContributorsResult = { count: 0, top: [], totalCommits: 0 };
  try {
    const base = `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors`;
    const params = new URLSearchParams({ per_page: "100", anon: "true" });
    let url: string | null = `${base}?${params}`;
    let count = 0;
    let totalCommits = 0;
    const humans: TopContributor[] = [];

    while (url) {
      const res = await fetch(url, {
        headers: getHeaders(),
        next: { revalidate: 3600 },
      });
      if (!res.ok) return empty;

      const data = (await res.json()) as GitHubContributor[];
      if (!Array.isArray(data)) return empty;

      for (const c of data) {
        totalCommits += c.contributions ?? 0;
        if (isBotContributor(c) || !c.login) continue;
        count += 1;
        humans.push({
          login: c.login,
          avatarUrl: c.avatar_url ?? "",
          contributions: c.contributions ?? 0,
          profileUrl: `https://github.com/${c.login}`,
        });
      }

      url = parseLinkNext(res.headers.get("Link"));
    }

    humans.sort((a, b) => b.contributions - a.contributions);
    return { count, top: humans.slice(0, TOP_CONTRIBUTORS_LIMIT), totalCommits };
  } catch {
    return empty;
  }
}

/** @deprecated Utiliser fetchContributors */
export async function fetchContributorCount(
  owner: string,
  repo: string,
): Promise<number | null> {
  const { count } = await fetchContributors(owner, repo);
  return count;
}

export async function fetchRepoLanguages(
  owner: string,
  repo: string,
): Promise<LanguageShare[]> {
  const data = await githubFetchOptional<Record<string, number>>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
  );
  if (!data) return [];

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (total === 0) return [];

  return entries.map(([name, bytes]) => ({
    name,
    bytes,
    percent: Math.round((bytes / total) * 1000) / 10,
  }));
}

function stripReleaseHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSummaryLine(line: string): string {
  return line
    .replace(/^#+\s*/, "")
    .replace(/^[-*•]\s+/, "")
    .replace(/^\d+\.\s+/, "")
    .trim();
}

function isMeaningfulSummaryLine(line: string): boolean {
  if (line.length < 4) return false;
  if (/^<a\b/i.test(line)) return false;
  if (/^v?\d+[\d.A-Za-z-]*$/i.test(line)) return false;
  return /[A-Za-zÀ-ÿ]{3,}/.test(line);
}

function releaseSummary(
  body: string | null | undefined,
  releaseName?: string | null,
  tagName?: string,
): string | null {
  if (body?.trim()) {
    const plain = stripReleaseHtml(body);
    for (const raw of plain.split(/\r?\n/)) {
      const line = normalizeSummaryLine(raw);
      if (!isMeaningfulSummaryLine(line)) continue;
      return line.length > 120 ? `${line.slice(0, 117)}…` : line;
    }
    const oneLine = normalizeSummaryLine(plain);
    if (isMeaningfulSummaryLine(oneLine)) {
      return oneLine.length > 120 ? `${oneLine.slice(0, 117)}…` : oneLine;
    }
  }

  const name = releaseName?.trim();
  if (name && tagName && name.toLowerCase() !== tagName.toLowerCase() && isMeaningfulSummaryLine(name)) {
    return name.length > 120 ? `${name.slice(0, 117)}…` : name;
  }

  return null;
}

export async function fetchRecentReleases(
  owner: string,
  repo: string,
  limit = 5,
): Promise<RecentRelease[]> {
  const data = await githubFetchOptional<
    {
      tag_name: string;
      name?: string;
      body?: string | null;
      published_at: string;
      html_url: string;
      draft?: boolean;
      prerelease?: boolean;
    }[]
  >(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases?per_page=${limit}`,
  );
  if (!data?.length) return [];

  return data
    .filter((r) => r.tag_name && !r.draft)
    .slice(0, limit)
    .map((r, i) => ({
      tagName: r.tag_name,
      title: r.name?.trim() || r.tag_name,
      summary: releaseSummary(r.body, r.name, r.tag_name),
      publishedAt: r.published_at,
      htmlUrl: r.html_url,
      isLatest: i === 0 && !r.prerelease,
    }));
}

export type GitHubIssueActivityItem = {
  number: number;
  title: string;
  state: string;
  updated_at: string;
  closed_at?: string | null;
  html_url: string;
  comments: number;
  pull_request?: unknown;
  user?: GitHubActor | null;
};

type GitHubIssueItem = GitHubIssueActivityItem;

export async function fetchRecentIssues(
  owner: string,
  repo: string,
  limit = 5,
): Promise<RecentIssue[]> {
  const issues: RecentIssue[] = [];
  const base = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`;
  let page = 1;

  while (issues.length < limit && page <= 5) {
    const params = new URLSearchParams({
      state: "all",
      sort: "updated",
      direction: "desc",
      per_page: "100",
      page: String(page),
    });
    const data = await githubFetchOptional<GitHubIssueItem[]>(`${base}?${params}`);
    if (!data?.length) break;

    for (const item of data) {
      if (item.pull_request || isGitHubBot(item.user)) continue;
      issues.push({
        number: item.number,
        title: item.title,
        state: item.state === "closed" ? "closed" : "open",
        updatedAt: item.updated_at,
        htmlUrl: item.html_url,
        comments: item.comments ?? 0,
      });
      if (issues.length >= limit) break;
    }

    if (data.length < 100) break;
    page += 1;
  }

  return issues;
}

export type GitHubPullActivityItem = {
  number: number;
  title: string;
  state: string;
  updated_at: string;
  html_url: string;
  draft?: boolean;
  comments?: number;
  user?: GitHubActor | null;
};

type GitHubPullItem = GitHubPullActivityItem;

export type GitHubCommitActivityItem = {
  commit: { committer: { date: string } };
};

/** Issues (hors PR) mises à jour depuis `sinceMs`, tri REST = /issues. */
export async function fetchIssuesUpdatedSince(
  owner: string,
  repo: string,
  sinceMs: number,
  onItem: (item: GitHubIssueActivityItem) => void,
): Promise<ActivityPaginateResult> {
  return paginateUpdatedDesc<GitHubIssueActivityItem>(
    owner,
    repo,
    "issues",
    sinceMs,
    onItem,
    (item) => !item.pull_request && !isGitHubBot(item.user),
  );
}

/** PR mises à jour depuis `sinceMs`, tri REST = /pulls. */
export async function fetchPullsUpdatedSince(
  owner: string,
  repo: string,
  sinceMs: number,
  onItem: (item: GitHubPullActivityItem) => void,
): Promise<ActivityPaginateResult> {
  return paginateUpdatedDesc<GitHubPullActivityItem>(
    owner,
    repo,
    "pulls",
    sinceMs,
    onItem,
    (item) => !isGitHubBot(item.user),
  );
}

/** Commits depuis `sinceIso` (paramètre API), bucket par date committer. */
export async function fetchCommitsSince(
  owner: string,
  repo: string,
  sinceMs: number,
  sinceIso: string,
  onItem: (item: GitHubCommitActivityItem) => void,
): Promise<ActivityPaginateResult> {
  const base = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits`;
  let page = 1;
  let truncated = false;

  while (page <= ACTIVITY_MAX_PAGES) {
    const params = new URLSearchParams({
      since: sinceIso,
      per_page: String(ACTIVITY_PER_PAGE),
      page: String(page),
    });
    const result = await githubFetchPage<GitHubCommitActivityItem[]>(`${base}?${params}`);
    if (!result?.data?.length) break;

    for (const item of result.data) {
      const t = new Date(item.commit.committer.date).getTime();
      if (t < sinceMs) continue;
      onItem(item);
    }

    const oldest = new Date(
      result.data[result.data.length - 1].commit.committer.date,
    ).getTime();
    if (oldest < sinceMs) break;

    if (result.data.length < ACTIVITY_PER_PAGE) break;
    page += 1;
  }

  if (page > ACTIVITY_MAX_PAGES) truncated = true;
  return { truncated };
}

export async function fetchRecentPulls(
  owner: string,
  repo: string,
  limit = 5,
): Promise<RecentPull[]> {
  const pulls: RecentPull[] = [];
  const base = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`;
  let page = 1;

  while (pulls.length < limit && page <= 5) {
    const params = new URLSearchParams({
      state: "all",
      sort: "updated",
      direction: "desc",
      per_page: "100",
      page: String(page),
    });
    const data = await githubFetchOptional<GitHubPullItem[]>(`${base}?${params}`);
    if (!data?.length) break;

    for (const item of data) {
      if (isGitHubBot(item.user)) continue;
      pulls.push({
        number: item.number,
        title: item.title,
        state: item.state === "closed" ? "closed" : "open",
        draft: item.draft ?? false,
        updatedAt: item.updated_at,
        htmlUrl: item.html_url,
        comments: item.comments ?? 0,
      });
      if (pulls.length >= limit) break;
    }

    if (data.length < 100) break;
    page += 1;
  }

  return pulls;
}

export async function fetchLatestRelease(
  owner: string,
  repo: string,
): Promise<LatestRelease | null> {
  const data = await githubFetchOptional<{
    tag_name: string;
    name: string;
    published_at: string;
    html_url: string;
  }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/latest`);

  if (!data?.tag_name) return null;
  return {
    tagName: data.tag_name,
    name: data.name || data.tag_name,
    publishedAt: data.published_at,
    htmlUrl: data.html_url,
  };
}

export async function fetchOpenPullCount(
  owner: string,
  repo: string,
): Promise<number | null> {
  try {
    const params = new URLSearchParams({ state: "open", per_page: "1" });
    const res = await fetch(
      `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?${params}`,
      { headers: getHeaders(), next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const lastPage = parseLinkLastPage(res.headers.get("Link"));
    if (lastPage != null) return lastPage;
    const data = (await res.json()) as unknown[];
    return Array.isArray(data) ? data.length : null;
  } catch {
    return null;
  }
}

export type SearchRepositoriesOptions = {
  perPage?: number;
  page?: number;
  sort?: "stars" | "updated" | "forks" | "help-wanted-issues";
  order?: "desc" | "asc";
};

export async function searchRepositories(
  query: string,
  options: SearchRepositoriesOptions = {},
): Promise<GitHubSearchItem[]> {
  const q = query.trim();
  if (!q) return [];

  const perPage = Math.min(Math.max(options.perPage ?? 10, 1), 100);
  const page = Math.max(options.page ?? 1, 1);
  const params = new URLSearchParams({
    q,
    sort: options.sort ?? "stars",
    order: options.order ?? "desc",
    per_page: String(perPage),
    page: String(page),
  });

  const data = await githubFetch<{ items: GitHubSearchItem[] }>(
    `/search/repositories?${params}`,
  );

  return data.items ?? [];
}

export async function searchRepos(
  query: string,
): Promise<GitHubSearchItem[]> {
  return searchRepositories(query, { perPage: 10 });
}
