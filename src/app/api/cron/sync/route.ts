import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/cron-auth";
import { discoverAndIndexPopularRepos } from "@/lib/discover-repos";
import { runCronUpdate } from "@/lib/run-cron-update";

/**
 * Route combinée pour Vercel Hobby (1 seul cron) :
 * - discover à minuit UTC ou si ?discover=1
 * - puis mise à jour de tous les repos indexés
 */
export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const forceDiscover =
    request.nextUrl.searchParams.get("discover") === "1";
  const hourUtc = new Date().getUTCHours();
  const shouldDiscover = forceDiscover || hourUtc === 0;

  try {
    let discoverResult = null;

    if (shouldDiscover) {
      discoverResult = await discoverAndIndexPopularRepos();
    }

    const updateResult = await runCronUpdate();

    return NextResponse.json({
      discover: discoverResult,
      update: updateResult,
      discoverRan: shouldDiscover,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
