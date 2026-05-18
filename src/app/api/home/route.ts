import { NextResponse } from "next/server";
import { getHomePageData } from "@/lib/home-data";

export async function GET() {
  try {
    const data = await getHomePageData();

    return NextResponse.json({
      trending: data.dailyTrending,
      growth: data.weeklyGrowth,
      latest: data.recent,
      languages: data.languages,
      usingGitHubFallback: data.usingGitHubFallback,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
