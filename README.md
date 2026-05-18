# GitHub Tracker

Plateforme inspirée de SteamDB pour suivre les repositories GitHub, historiser les statistiques et afficher les tendances.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** + **shadcn/ui**
- **Supabase** (PostgreSQL)
- **Recharts** (graphiques)
- **GitHub REST API** + **Vercel Cron**

## Démarrage

1. Copier les variables d'environnement :

```bash
cp .env.local.example .env.local
```

2. Renseigner `.env.local` :

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé publishable (dashboard API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service_role (secrète, serveur uniquement) |
| `GITHUB_TOKEN` | Personal Access Token GitHub |
| `CRON_SECRET` | Secret pour sécuriser cron et seed |

3. Exécuter les migrations SQL dans le dashboard Supabase (SQL Editor) :
   - [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
   - [`supabase/migrations/002_home_rpc.sql`](supabase/migrations/002_home_rpc.sql) — fonctions RPC pour la homepage

4. Lancer le serveur :

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Indexation automatique

Un **cron quotidien** découvre les repos populaires via GitHub Search (`stars:>10000` par défaut) et les indexe s'ils ne sont pas déjà en base. Le **cron horaire** actualise ensuite tous les repos indexés.

| Plan Vercel | Configuration | Comportement |
|-------------|---------------|--------------|
| **Hobby** (défaut) | 1 cron : `0 0 * * *` → `/api/cron/sync` | Chaque jour : discover + update de tous les repos |
| **Pro** | 2 crons (voir ci-dessous) | Discover quotidien + update horaire |

Test en local :

```bash
# Équivalent cron Hobby / quotidien (discover + update)
curl -H "Authorization: Bearer VOTRE_CRON_SECRET" http://localhost:3000/api/cron/sync

# Découverte seule
curl -H "Authorization: Bearer VOTRE_CRON_SECRET" http://localhost:3000/api/cron/discover

# Mise à jour seule
curl -H "Authorization: Bearer VOTRE_CRON_SECRET" http://localhost:3000/api/cron/update

# Update sans discover
curl -H "Authorization: Bearer VOTRE_CRON_SECRET" "http://localhost:3000/api/cron/sync?discover=0"
```

Variables optionnelles : `DISCOVER_MIN_STARS`, `DISCOVER_MAX_NEW_PER_RUN`, `DISCOVER_SEARCH_LIMIT` (voir `.env.local.example`).

### Vercel Pro (crons horaires)

Sur un plan Pro, vous pouvez remplacer l'entrée unique de [`vercel.json`](vercel.json) par :

```json
{
  "crons": [
    { "path": "/api/cron/discover", "schedule": "0 0 * * *" },
    { "path": "/api/cron/update", "schedule": "0 * * * *" }
  ]
}
```

## Peupler les données (seed)

Le seed appelle la même logique que le cron discover :

```bash
curl -X POST -H "Authorization: Bearer VOTRE_CRON_SECRET" http://localhost:3000/api/seed
```

Ou visitez directement un repo, ex. [http://localhost:3000/github/vercel/next.js](http://localhost:3000/github/vercel/next.js).

Le **trending** nécessite au moins **2 collectes** par repository (visite + actualisation, ou 2 passages du cron).

## Homepage (données Supabase)

Les 4 cartes de l'accueil sont alimentées par `repository_history` via des fonctions SQL :

| Carte | Source |
|-------|--------|
| Trending aujourd'hui | `get_trending_daily()` — gain de stars sur 24h |
| Top croissance (7j) | `get_growth_weekly()` — croissance % sur 7 jours |
| Derniers dépôts | `repositories` triés par `last_synced_at` |
| Langages populaires | `get_popular_languages()` — COUNT par langage |

API agrégée :

```bash
curl http://localhost:3000/api/home
```

Réponse : `{ trending, growth, latest, languages, usingGitHubFallback }`

Si l'historique est vide, un fallback GitHub API (`stars:>50000`) complète trending/croissance/langages.

## Cron (configuration)

Voir [Indexation automatique](#indexation-automatique). Configuration dans [`vercel.json`](vercel.json).

## Déploiement Vercel

1. Pousser le repo sur GitHub et importer dans Vercel
2. **Variables d'environnement sur Vercel** (Settings → Environment Variables) — cochez **Production**, **Preview** et **Development** pour chaque variable :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GITHUB_TOKEN`
   - `CRON_SECRET`
   - Optionnelles : `DISCOVER_MIN_STARS`, `DISCOVER_MAX_NEW_PER_RUN`, `DISCOVER_SEARCH_LIMIT`

   Sans `NEXT_PUBLIC_SUPABASE_*`, le build peut passer mais l'app n'aura pas de données Supabase (fallback GitHub limité sur l'accueil).
3. Exécuter la migration [`002_home_rpc.sql`](supabase/migrations/002_home_rpc.sql) dans Supabase
4. Déployer — les crons de [`vercel.json`](vercel.json) s'activent après le deploy (`discover` + `update`)
5. Vérifier localement avant/après deploy :

```bash
npm run verify:indexation
```

6. Smoke test en production (remplacer l'URL) :

```bash
curl -H "Authorization: Bearer VOTRE_CRON_SECRET" https://votre-app.vercel.app/api/cron/discover
curl -H "Authorization: Bearer VOTRE_CRON_SECRET" https://votre-app.vercel.app/api/cron/update
```

Réponse JSON attendue (pas une page HTML). Si `401`, vérifier `CRON_SECRET` sur Vercel.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Recherche, trending preview, derniers repos |
| `/github/[owner]/[repo]` | Stats, graphiques, historique |
| `/trending` | Classements daily / weekly / monthly |

## API

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/home` | GET | Données homepage (trending, growth, latest, languages) |
| `/api/search?q=` | GET | Recherche GitHub |
| `/api/repos/[owner]/[repo]` | GET | Repo + historique (`?force=1` pour resync) |
| `/api/cron/discover` | GET | Découverte + indexation repos populaires (auth Bearer) |
| `/api/cron/update` | GET | Sync tous les repos indexés (auth Bearer) |
| `/api/cron/sync` | GET | Discover (minuit UTC) + update — fallback Hobby (auth Bearer) |
| `/api/seed` | POST | Même logique que discover (auth Bearer) |

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur local |
| `npm run build` | Build production |
| `npm run lint` | ESLint |
| `npm run verify:indexation` | Vérifie env, RPC Supabase, crons et compte repos |
