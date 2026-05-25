/**
 * Vérifie GITHUB_TOKEN pour l’app GitHub-only.
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
    /* .env.local optionnel */
  }
}

loadEnvLocal();

function checkEnv() {
  const missing = ["GITHUB_TOKEN"].filter((k) => !process.env[k]?.trim());
  return { missing, ok: missing.length === 0 };
}

async function main() {
  const env = checkEnv();
  console.log("=== Variables d'environnement ===");
  console.log(
    env.ok ? "OK: GITHUB_TOKEN" : `ERREUR: manquantes: ${env.missing.join(", ")}`,
  );

  if (!env.ok) {
    process.exitCode = 1;
    return;
  }

  console.log("\nMode GitHub-only : pas de Supabase ni de cron.");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
