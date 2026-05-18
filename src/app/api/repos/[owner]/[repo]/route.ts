import { NextRequest, NextResponse } from "next/server";
import { GitHubApiError } from "@/lib/github";
import { getRepositoryWithHistory } from "@/lib/repositories";

type RouteContext = {
  params: Promise<{ owner: string; repo: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { owner, repo } = await context.params;
  const force = request.nextUrl.searchParams.get("force") === "1";

  try {
    const data = await getRepositoryWithHistory(owner, repo, { force });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof GitHubApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
