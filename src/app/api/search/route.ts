import { NextRequest, NextResponse } from "next/server";
import { GitHubApiError, searchRepos } from "@/lib/github";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ items: [] });
  }

  try {
    const items = await searchRepos(q);
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
