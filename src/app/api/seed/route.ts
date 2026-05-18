import { NextRequest, NextResponse } from "next/server";
import { syncRepository } from "@/lib/repositories";

const SEED_REPOS = [
  ["vercel", "next.js"],
  ["facebook", "react"],
  ["vuejs", "vue"],
  ["sveltejs", "svelte"],
  ["microsoft", "vscode"],
  ["tailwindlabs", "tailwindcss"],
  ["supabase", "supabase"],
  ["nodejs", "node"],
] as const;

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const results: { full_name: string; ok: boolean; error?: string }[] = [];

  for (const [owner, name] of SEED_REPOS) {
    try {
      await syncRepository(owner, name);
      results.push({ full_name: `${owner}/${name}`, ok: true });
    } catch (err) {
      results.push({
        full_name: `${owner}/${name}`,
        ok: false,
        error: err instanceof Error ? err.message : "erreur",
      });
    }
  }

  return NextResponse.json({
    message: "Seed terminé",
    results,
  });
}
