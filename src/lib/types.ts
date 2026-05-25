export type Repository = {
  id: number;
  github_id: number;
  owner: string;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  watchers: number;
  open_issues: number;
  created_at: string | null;
  updated_at: string | null;
  last_synced_at: string | null;
};

export type GitHubRepoParent = {
  full_name: string;
  owner: { login: string };
};

export type GitHubRepoResponse = {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url?: string };
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  subscribers_count: number;
  open_issues_count: number;
  network_count?: number;
  created_at: string;
  updated_at: string;
  pushed_at?: string;
  homepage?: string | null;
  topics?: string[];
  size?: number;
  default_branch?: string;
  license?: { spdx_id: string | null; name: string } | null;
  fork?: boolean;
  parent?: GitHubRepoParent | null;
  visibility?: "public" | "private" | "internal";
  archived?: boolean;
  disabled?: boolean;
  is_template?: boolean;
  has_wiki?: boolean;
  has_projects?: boolean;
  has_discussions?: boolean;
};

export type LanguageShare = {
  name: string;
  bytes: number;
  percent: number;
};

export type LatestRelease = {
  tagName: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
};

export type RecentRelease = {
  tagName: string;
  title: string;
  summary: string | null;
  publishedAt: string;
  htmlUrl: string;
  isLatest: boolean;
};

export type RecentIssue = {
  number: number;
  title: string;
  state: "open" | "closed";
  updatedAt: string;
  htmlUrl: string;
  comments: number;
};

export type RecentPull = {
  number: number;
  title: string;
  state: "open" | "closed";
  draft: boolean;
  updatedAt: string;
  htmlUrl: string;
  comments: number;
};

export type TopContributor = {
  login: string;
  avatarUrl: string;
  contributions: number;
  profileUrl: string;
};

export type ContributorsResult = {
  count: number;
  top: TopContributor[];
  /** Somme des contributions (commits sur la branche par défaut). */
  totalCommits: number;
};

export type RepoPageExtras = {
  topics: string[];
  homepage: string | null;
  license: string | null;
  sizeKb: number;
  defaultBranch: string;
  pushedAt: string | null;
  updatedAt: string;
  avatarUrl: string;
  fork: boolean;
  parentFullName: string | null;
  visibility: "public" | "private" | "internal" | null;
  archived: boolean;
  disabled: boolean;
  isTemplate: boolean;
  networkCount: number;
  hasWiki: boolean;
  hasProjects: boolean;
  hasDiscussions: boolean;
  languages: LanguageShare[];
  latestRelease: LatestRelease | null;
  openPullRequests: number | null;
  totalCommits: number | null;
};

export type GitHubSearchItem = {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url?: string };
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url?: string;
  pushed_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type HomeRepoRow = {
  id: number;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  pushedAt: string | null;
  createdAt: string | null;
};

export type HomeDatabaseLists = {
  topStars: HomeRepoRow[];
  topCreated30d: HomeRepoRow[];
  fetchedAt: string;
  hasToken: boolean;
};

export type RepoGitHubActivityDay = {
  dayIso: string;
  dayLabel: string;
  commits: number;
  issues: number;
  /** Total PR créées (brouillon + ouvertes non-brouillon). */
  prs: number;
  prsDraft: number;
  prsOpen: number;
  issuesClosed: number;
};

export type RepoActivityStatus = "ok" | "no_token" | "error";

export type RepoGitHubActivity = {
  owner: string;
  name: string;
  daily: RepoGitHubActivityDay[];
  totals14d: {
    commits: number;
    issues: number;
    prs: number;
    prsDraft: number;
    prsOpen: number;
    issuesClosed: number;
  };
  ratesPerDay: {
    commits: number;
    issues: number;
    prs: number;
    prsDraft: number;
    prsOpen: number;
    issuesClosed: number;
  };
  fetchedAt: string;
  status: RepoActivityStatus;
  /** true si la pagination REST a atteint le plafond (dépôt très actif). */
  activityTruncated?: boolean;
};

function normalizeActivityDay(
  d: RepoGitHubActivityDay & { prsDraft?: number; prsOpen?: number },
): RepoGitHubActivityDay {
  const hasSplit = d.prsDraft != null || d.prsOpen != null;
  const prsDraft = d.prsDraft ?? 0;
  const prsOpen = d.prsOpen ?? (hasSplit ? 0 : (d.prs ?? 0));
  const prs = hasSplit ? prsDraft + prsOpen : (d.prs ?? 0);
  return {
    ...d,
    issuesClosed: d.issuesClosed ?? 0,
    prsDraft,
    prsOpen,
    prs,
  };
}

/** Rétrocompat cache / anciennes réponses sans champs récents. */
export function normalizeRepoGitHubActivity(activity: RepoGitHubActivity): RepoGitHubActivity {
  const daily = activity.daily.map((d) => normalizeActivityDay(d));
  const totals14d = {
    commits: activity.totals14d?.commits ?? 0,
    issues: activity.totals14d?.issues ?? 0,
    prs: daily.reduce((s, d) => s + d.prs, 0),
    prsDraft: activity.totals14d?.prsDraft ?? daily.reduce((s, d) => s + d.prsDraft, 0),
    prsOpen: activity.totals14d?.prsOpen ?? daily.reduce((s, d) => s + d.prsOpen, 0),
    issuesClosed: activity.totals14d?.issuesClosed ?? 0,
  };
  const ratesPerDay = {
    commits: activity.ratesPerDay?.commits ?? totals14d.commits / 14,
    issues: activity.ratesPerDay?.issues ?? totals14d.issues / 14,
    prs: activity.ratesPerDay?.prs ?? totals14d.prs / 14,
    prsDraft: activity.ratesPerDay?.prsDraft ?? totals14d.prsDraft / 14,
    prsOpen: activity.ratesPerDay?.prsOpen ?? totals14d.prsOpen / 14,
    issuesClosed: activity.ratesPerDay?.issuesClosed ?? totals14d.issuesClosed / 14,
  };
  return { ...activity, daily, totals14d, ratesPerDay };
}

export function emptyRepoGitHubActivity(
  owner: string,
  name: string,
  status: RepoActivityStatus = "error",
): RepoGitHubActivity {
  const daily: RepoGitHubActivityDay[] = Array.from({ length: 14 }, (_, i) => ({
    dayIso: "",
    dayLabel: `J${i + 1}`,
    commits: 0,
    issues: 0,
    prs: 0,
    prsDraft: 0,
    prsOpen: 0,
    issuesClosed: 0,
  }));
  return {
    owner,
    name,
    daily,
    totals14d: { commits: 0, issues: 0, prs: 0, prsDraft: 0, prsOpen: 0, issuesClosed: 0 },
    ratesPerDay: { commits: 0, issues: 0, prs: 0, prsDraft: 0, prsOpen: 0, issuesClosed: 0 },
    fetchedAt: new Date().toISOString(),
    status,
  };
}

