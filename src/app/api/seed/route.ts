import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/cron-auth";
import { discoverAndIndexPopularRepos } from "@/lib/discover-repos";

export async function POST(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const discover = await discoverAndIndexPopularRepos();
    return NextResponse.json({
      message: "Seed terminé (découverte GitHub Search)",
      ...discover,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
