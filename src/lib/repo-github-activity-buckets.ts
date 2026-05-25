/** Compteurs journaliers UTC pour l’agrégation d’activité REST. */
export type DayBucketCounts = {
  commits: number;
  issues: number;
  issuesClosed: number;
  prsDraft: number;
  prsOpen: number;
};

export type DayBuckets = Record<string, DayBucketCounts>;

export function createEmptyBucket(): DayBucketCounts {
  return {
    commits: 0,
    issues: 0,
    issuesClosed: 0,
    prsDraft: 0,
    prsOpen: 0,
  };
}

export function createDayBuckets(ymdKeys: readonly string[]): DayBuckets {
  const buckets: DayBuckets = {};
  for (const ymd of ymdKeys) {
    buckets[ymd] = createEmptyBucket();
  }
  return buckets;
}

export function utcYmdFromIso(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function isInBucketWindow(ymd: string, ymdKeys: ReadonlySet<string>): boolean {
  return ymdKeys.has(ymd);
}

export function bucketOpenIssueUpdate(
  buckets: DayBuckets,
  ymdKeys: ReadonlySet<string>,
  updatedAt: string,
): void {
  const ymd = utcYmdFromIso(updatedAt);
  if (!ymd || !isInBucketWindow(ymd, ymdKeys)) return;
  buckets[ymd].issues += 1;
}

export function bucketIssueClosed(
  buckets: DayBuckets,
  ymdKeys: ReadonlySet<string>,
  closedAt: string,
): void {
  const ymd = utcYmdFromIso(closedAt);
  if (!ymd || !isInBucketWindow(ymd, ymdKeys)) return;
  buckets[ymd].issuesClosed += 1;
}

export function bucketPullUpdate(
  buckets: DayBuckets,
  ymdKeys: ReadonlySet<string>,
  pull: { draft?: boolean; state: string; updated_at: string },
): void {
  const ymd = utcYmdFromIso(pull.updated_at);
  if (!ymd || !isInBucketWindow(ymd, ymdKeys)) return;
  if (pull.draft) {
    buckets[ymd].prsDraft += 1;
  } else if (pull.state === "open") {
    buckets[ymd].prsOpen += 1;
  }
}

export function bucketCommit(
  buckets: DayBuckets,
  ymdKeys: ReadonlySet<string>,
  committerDate: string,
): void {
  const ymd = utcYmdFromIso(committerDate);
  if (!ymd || !isInBucketWindow(ymd, ymdKeys)) return;
  buckets[ymd].commits += 1;
}

export function bucketsToDaily(
  slots: { dayIso: string; dayLabel: string; ymd: string }[],
  buckets: DayBuckets,
): {
  dayIso: string;
  dayLabel: string;
  commits: number;
  issues: number;
  prs: number;
  prsDraft: number;
  prsOpen: number;
  issuesClosed: number;
}[] {
  return slots.map((slot) => {
    const b = buckets[slot.ymd] ?? createEmptyBucket();
    return {
      dayIso: slot.dayIso,
      dayLabel: slot.dayLabel,
      commits: b.commits,
      issues: b.issues,
      prsDraft: b.prsDraft,
      prsOpen: b.prsOpen,
      prs: b.prsDraft + b.prsOpen,
      issuesClosed: b.issuesClosed,
    };
  });
}
