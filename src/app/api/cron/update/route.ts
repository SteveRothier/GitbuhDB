import { NextRequest, NextResponse } from "next/server";
import { listAllRepositories, syncRepository } from "@/lib/repositories";

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const repos = await listAllRepositories();

  if (repos.length === 0) {
    return NextResponse.json({
      message: "Aucun repository à synchroniser",
      synced: 0,
      failed: 0,
    });
  }

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < repos.length; i += BATCH_SIZE) {
    const batch = repos.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (repo) => {
        try {
          await syncRepository(repo.owner, repo.name);
          synced++;
        } catch (err) {
          failed++;
          errors.push(
            `${repo.full_name}: ${err instanceof Error ? err.message : "erreur"}`,
          );
        }
      }),
    );

    if (i + BATCH_SIZE < repos.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  return NextResponse.json({
    message: "Synchronisation terminée",
    synced,
    failed,
    total: repos.length,
    errors: errors.slice(0, 10),
  });
}
