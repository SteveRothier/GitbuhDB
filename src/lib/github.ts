import type { GitHubRepoResponse, GitHubSearchItem } from "@/lib/types";

const GITHUB_API = "https://api.github.com";

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
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

export async function fetchRepo(
  owner: string,
  repo: string,
): Promise<GitHubRepoResponse> {
  return githubFetch<GitHubRepoResponse>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
  );
}

export async function searchRepos(
  query: string,
): Promise<GitHubSearchItem[]> {
  const q = query.trim();
  if (!q) return [];

  const params = new URLSearchParams({
    q: q.includes("/") ? q : q,
    sort: "stars",
    order: "desc",
    per_page: "10",
  });

  const data = await githubFetch<{ items: GitHubSearchItem[] }>(
    `/search/repositories?${params}`,
  );

  return data.items ?? [];
}
