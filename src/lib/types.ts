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

export type RepositoryHistory = {
  id: number;
  repository_id: number;
  stars: number;
  forks: number;
  watchers: number;
  open_issues: number;
  collected_at: string;
};

export type GitHubRepoResponse = {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  subscribers_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
};

export type GitHubSearchItem = {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
};

export type TrendingPeriod = "daily" | "weekly" | "monthly";

export type TrendingRepo = {
  id: number;
  owner: string;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stars: number;
  growth: number;
  growthPercent?: number;
};

export type LanguageStat = {
  language: string;
  count: number;
  percent: number;
};

export type HomeRepoDisplay = {
  id: number;
  owner: string;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stars: number;
  growth?: number;
  growthPercent?: number;
};

export const POPULAR_REPO_TAGS = [
  "vercel/next.js",
  "facebook/react",
  "microsoft/vscode",
  "tailwindlabs/tailwindcss",
  "rust-lang/rust",
] as const;
