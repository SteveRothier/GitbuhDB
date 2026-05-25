import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { GitHubApiError } from "@/lib/github";
import {
  getRepoGitHubActivityCached,
  repoActivityCacheTag,
} from "@/lib/repo-github-activity";
import { getRepositoryFromGitHub } from "@/lib/repo-page-data";

type RouteContext = {
  params: Promise<{ owner: string; repo: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { owner, repo } = await context.params;
  const force = request.nextUrl.searchParams.get("force") === "1";

  try {
    if (force) {
      revalidateTag(repoActivityCacheTag(owner, repo), { expire: 0 });
      revalidatePath(`/github/${owner}/${repo}`);
    }

    const [repository, activity] = await Promise.all([
      getRepositoryFromGitHub(owner, repo),
      getRepoGitHubActivityCached(owner, repo),
    ]);

    return NextResponse.json({ repo: repository, activity });
  } catch (err) {
    if (err instanceof GitHubApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
