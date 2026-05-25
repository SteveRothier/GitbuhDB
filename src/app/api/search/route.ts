import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { GitHubApiError, searchRepos } from "@/lib/github";

async function cachedSearch(q: string) {
  return searchRepos(q);
}

function getCachedSearch(q: string) {
  return unstable_cache(
    () => cachedSearch(q),
    ["github-search", q],
    { revalidate: 1800 },
  )();
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ items: [] });
  }

  try {
    const items = await getCachedSearch(q);
    return NextResponse.json({ items });
  } catch (err) {
    if (err instanceof GitHubApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 },
    );
  }
}
