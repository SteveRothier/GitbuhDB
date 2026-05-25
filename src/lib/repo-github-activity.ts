import { unstable_cache } from "next/cache";
import {
  fetchCommitsSince,
  fetchIssuesUpdatedSince,
  fetchPullsUpdatedSince,
} from "@/lib/github";
import {
  bucketCommit,
  bucketIssueClosed,
  bucketOpenIssueUpdate,
  bucketPullUpdate,
  bucketsToDaily,
  createDayBuckets,
} from "@/lib/repo-github-activity-buckets";
import type { RepoGitHubActivity } from "@/lib/types";
import { emptyRepoGitHubActivity, normalizeRepoGitHubActivity } from "@/lib/types";

const DAYS = 14;

function utcDayStart(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0),
  );
}

function utcYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDayLabel(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(d);
}

type DaySlot = { start: Date; dayLabel: string; dayIso: string; ymd: string };

function buildUtcDaySlots(now: Date): DaySlot[] {
  const today0 = utcDayStart(now);
  const slots: DaySlot[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const start = new Date(today0.getTime() - i * 86400000);
    const ymd = utcYmd(start);
    slots.push({
      start,
      dayLabel: formatDayLabel(start),
      dayIso: `${ymd}T00:00:00Z`,
      ymd,
    });
  }
  return slots;
}

/** Activité REST GitHub sur 14 jours (même source que /issues, /pulls, commits). */
export async function fetchRepoGitHubActivity(
  owner: string,
  name: string,
): Promise<RepoGitHubActivity> {
  if (!process.env.GITHUB_TOKEN?.trim()) {
    console.warn("repo-github-activity: GITHUB_TOKEN absent");
    return emptyRepoGitHubActivity(owner, name, "no_token");
  }

  const now = new Date();
  const windowStart = utcDayStart(new Date(now.getTime() - (DAYS - 1) * 86400000));
  const sinceMs = windowStart.getTime();
  const sinceIso = windowStart.toISOString().replace(/\.\d{3}Z$/, "Z");

  try {
    const slots = buildUtcDaySlots(now);
    const ymdKeys = new Set(slots.map((s) => s.ymd));
    const buckets = createDayBuckets(slots.map((s) => s.ymd));

    const [issuesResult, pullsResult, commitsResult] = await Promise.all([
      fetchIssuesUpdatedSince(owner, name, sinceMs, (item) => {
        if (item.state === "open") {
          bucketOpenIssueUpdate(buckets, ymdKeys, item.updated_at);
        }
        if (item.closed_at) {
          bucketIssueClosed(buckets, ymdKeys, item.closed_at);
        }
      }),
      fetchPullsUpdatedSince(owner, name, sinceMs, (item) => {
        bucketPullUpdate(buckets, ymdKeys, item);
      }),
      fetchCommitsSince(owner, name, sinceMs, sinceIso, (item) => {
        bucketCommit(buckets, ymdKeys, item.commit.committer.date);
      }),
    ]);

    const activityTruncated =
      issuesResult.truncated || pullsResult.truncated || commitsResult.truncated;
    if (activityTruncated) {
      console.warn(
        `fetchRepoGitHubActivity ${owner}/${name}: activité tronquée (plafond pagination)`,
      );
    }

    const daily = bucketsToDaily(slots, buckets);

    const totals14d = daily.reduce(
      (acc, d) => ({
        commits: acc.commits + d.commits,
        issues: acc.issues + d.issues,
        prs: acc.prs + d.prs,
        prsDraft: acc.prsDraft + d.prsDraft,
        prsOpen: acc.prsOpen + d.prsOpen,
        issuesClosed: acc.issuesClosed + d.issuesClosed,
      }),
      { commits: 0, issues: 0, prs: 0, prsDraft: 0, prsOpen: 0, issuesClosed: 0 },
    );

    const ratesPerDay = {
      commits: totals14d.commits / DAYS,
      issues: totals14d.issues / DAYS,
      prs: totals14d.prs / DAYS,
      prsDraft: totals14d.prsDraft / DAYS,
      prsOpen: totals14d.prsOpen / DAYS,
      issuesClosed: totals14d.issuesClosed / DAYS,
    };

    return normalizeRepoGitHubActivity({
      owner,
      name,
      daily,
      totals14d,
      ratesPerDay,
      fetchedAt: now.toISOString(),
      status: "ok",
      activityTruncated,
    });
  } catch (e) {
    console.error(`fetchRepoGitHubActivity ${owner}/${name}:`, e);
    return emptyRepoGitHubActivity(owner, name, "error");
  }
}

export function repoActivityCacheTag(owner: string, name: string): string {
  return `repo-github-activity:${owner.toLowerCase()}:${name.toLowerCase()}`;
}

export function getRepoGitHubActivityCached(owner: string, name: string) {
  return unstable_cache(
    async () => normalizeRepoGitHubActivity(await fetchRepoGitHubActivity(owner, name)),
    ["repo-github-activity-v5", owner.toLowerCase(), name.toLowerCase()],
    {
      revalidate: 1800,
      tags: [repoActivityCacheTag(owner, name)],
    },
  )();
}
