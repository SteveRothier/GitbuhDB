import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/cron-auth";
import { discoverAndIndexPopularRepos } from "@/lib/discover-repos";
import { runCronUpdate } from "@/lib/run-cron-update";

/**
 * Route combinée pour Vercel Hobby (1 cron/jour max) :
 * discover + update à chaque passage.
 * ?discover=0 pour ne lancer que la mise à jour (tests manuels).
 */
export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const skipDiscover =
    request.nextUrl.searchParams.get("discover") === "0";

  try {
    let discoverResult = null;

    if (!skipDiscover) {
      discoverResult = await discoverAndIndexPopularRepos();
    }

    const updateResult = await runCronUpdate();

    return NextResponse.json({
      discover: discoverResult,
      update: updateResult,
      discoverRan: !skipDiscover,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
