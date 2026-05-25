import { describe, expect, it } from "vitest";
import {
  bucketCommit,
  bucketIssueClosed,
  bucketOpenIssueUpdate,
  bucketPullUpdate,
  bucketsToDaily,
  createDayBuckets,
  utcYmdFromIso,
} from "@/lib/repo-github-activity-buckets";

const YMD_KEYS = new Set(["2026-05-20", "2026-05-21"]);

describe("utcYmdFromIso", () => {
  it("extrait le jour UTC", () => {
    expect(utcYmdFromIso("2026-05-20T23:59:59Z")).toBe("2026-05-20");
  });

  it("retourne null si date invalide", () => {
    expect(utcYmdFromIso("invalid")).toBeNull();
  });
});

describe("bucketOpenIssueUpdate", () => {
  it("incrémente issues pour une MAJ dans la fenêtre", () => {
    const buckets = createDayBuckets([...YMD_KEYS]);
    bucketOpenIssueUpdate(buckets, YMD_KEYS, "2026-05-21T10:00:00Z");
    expect(buckets["2026-05-21"].issues).toBe(1);
    expect(buckets["2026-05-20"].issues).toBe(0);
  });

  it("ignore les dates hors fenêtre", () => {
    const buckets = createDayBuckets([...YMD_KEYS]);
    bucketOpenIssueUpdate(buckets, YMD_KEYS, "2026-05-19T10:00:00Z");
    expect(buckets["2026-05-20"].issues).toBe(0);
  });
});

describe("bucketIssueClosed", () => {
  it("incrémente issuesClosed sur closed_at", () => {
    const buckets = createDayBuckets([...YMD_KEYS]);
    bucketIssueClosed(buckets, YMD_KEYS, "2026-05-20T18:00:00Z");
    expect(buckets["2026-05-20"].issuesClosed).toBe(1);
  });
});

describe("bucketPullUpdate", () => {
  it("compte brouillon et ouvertes séparément", () => {
    const buckets = createDayBuckets([...YMD_KEYS]);
    bucketPullUpdate(buckets, YMD_KEYS, {
      draft: true,
      state: "open",
      updated_at: "2026-05-21T12:00:00Z",
    });
    bucketPullUpdate(buckets, YMD_KEYS, {
      draft: false,
      state: "open",
      updated_at: "2026-05-21T14:00:00Z",
    });
    bucketPullUpdate(buckets, YMD_KEYS, {
      draft: false,
      state: "closed",
      updated_at: "2026-05-21T16:00:00Z",
    });
    expect(buckets["2026-05-21"].prsDraft).toBe(1);
    expect(buckets["2026-05-21"].prsOpen).toBe(1);
  });
});

describe("bucketCommit", () => {
  it("incrémente commits par date committer", () => {
    const buckets = createDayBuckets([...YMD_KEYS]);
    bucketCommit(buckets, YMD_KEYS, "2026-05-20T08:30:00Z");
    expect(buckets["2026-05-20"].commits).toBe(1);
  });
});

describe("bucketsToDaily", () => {
  it("produit prs = draft + open", () => {
    const buckets = createDayBuckets(["2026-05-20"]);
    buckets["2026-05-20"].prsDraft = 2;
    buckets["2026-05-20"].prsOpen = 3;
    const daily = bucketsToDaily(
      [{ dayIso: "2026-05-20T00:00:00Z", dayLabel: "20 mai", ymd: "2026-05-20" }],
      buckets,
    );
    expect(daily[0].prs).toBe(5);
    expect(daily[0].prsDraft).toBe(2);
    expect(daily[0].prsOpen).toBe(3);
  });
});
