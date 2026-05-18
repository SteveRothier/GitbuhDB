/**
 * Vérifie l'activation de l'indexation automatique (env, RPC Supabase, repos).
 * Usage: node scripts/verify-indexation.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* .env.local optionnel si vars déjà exportées */
  }
}

loadEnvLocal();

const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GITHUB_TOKEN",
  "CRON_SECRET",
];

const OPTIONAL = [
  "DISCOVER_MIN_STARS",
  "DISCOVER_MAX_NEW_PER_RUN",
  "DISCOVER_SEARCH_LIMIT",
];

function checkEnv() {
  const missing = REQUIRED.filter((k) => !process.env[k]?.trim());
  const optionalSet = OPTIONAL.filter((k) => process.env[k]?.trim());
  return { missing, optionalSet, ok: missing.length === 0 };
}

async function checkRpc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(`${url}/rest/v1/rpc/get_trending_daily`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (res.ok) return { ok: true, status: res.status };
  const text = await res.text();
  return { ok: false, status: res.status, error: text.slice(0, 200) };
}

async function countRepos() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(
    `${url}/rest/v1/repositories?select=id&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "count=exact",
      },
    },
  );
  const range = res.headers.get("content-range");
  const total = range?.includes("/") ? range.split("/")[1] : "?";
  return { ok: res.ok, total, status: res.status };
}

async function main() {
  const env = checkEnv();
  console.log("=== Variables d'environnement ===");
  console.log(
    env.ok ? "OK: variables requises présentes" : `ERREUR: manquantes: ${env.missing.join(", ")}`,
  );
  console.log(
    `Optionnelles DISCOVER_* définies: ${env.optionalSet.length > 0 ? env.optionalSet.join(", ") : "(défauts code: 10000 / 15 / 30)"}`,
  );

  if (!env.ok) {
    process.exitCode = 1;
    return;
  }

  console.log("\n=== Migration 002 (RPC) ===");
  const rpc = await checkRpc();
  if (rpc.ok) {
    console.log("OK: get_trending_daily() accessible");
  } else {
    console.log(`ERREUR ${rpc.status}: exécutez supabase/migrations/002_home_rpc.sql`);
    console.log(rpc.error ?? "");
    process.exitCode = 1;
  }

  console.log("\n=== Repositories indexés ===");
  const repos = await countRepos();
  if (repos.ok) {
    console.log(`OK: ${repos.total} repository(ies) en base`);
  } else {
    console.log(`ERREUR ${repos.status} lors du comptage`);
    process.exitCode = 1;
  }

  const vercelJson = JSON.parse(
    readFileSync(resolve(root, "vercel.json"), "utf8"),
  );
  console.log("\n=== vercel.json crons ===");
  for (const c of vercelJson.crons ?? []) {
    console.log(`  ${c.schedule} → ${c.path}`);
  }
  const hourly = (vercelJson.crons ?? []).some(
    (c) => c.schedule === "0 * * * *",
  );
  if (hourly) {
    console.log(
      "ATTENTION: un cron horaire (0 * * * *) nécessite Vercel Pro. Hobby = 1×/jour via /api/cron/sync",
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
