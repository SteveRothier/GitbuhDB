import { getRepoGitHubActivityCached } from "@/lib/repo-github-activity";
import { fetchRecentIssues, fetchRecentPulls, fetchRecentReleases } from "@/lib/github";
import type { RepoPageExtras } from "@/lib/types";
import { RepoDashboardCharts } from "@/components/repo/repo-dashboard-charts";

export async function RepoChartsSection({
  owner,
  repoName,
  language,
  extras,
}: {
  owner: string;
  repoName: string;
  language: string | null;
  extras: RepoPageExtras;
}) {
  const [activity, recentReleases, recentIssues, recentPulls] = await Promise.all([
    getRepoGitHubActivityCached(owner, repoName),
    fetchRecentReleases(owner, repoName),
    fetchRecentIssues(owner, repoName),
    fetchRecentPulls(owner, repoName),
  ]);

  const issuesUrl = `https://github.com/${owner}/${repoName}/issues`;
  const releasesUrl = `https://github.com/${owner}/${repoName}/releases`;
  const pullsUrl = `https://github.com/${owner}/${repoName}/pulls`;

  return (
    <RepoDashboardCharts
      activity={activity}
      language={language}
      extras={extras}
      recentReleases={recentReleases}
      recentIssues={recentIssues}
      recentPulls={recentPulls}
      issuesUrl={issuesUrl}
      releasesUrl={releasesUrl}
      pullsUrl={pullsUrl}
    />
  );
}
