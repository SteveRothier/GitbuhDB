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

3. Exécuter la migration SQL dans le dashboard Supabase :
   [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)

4. Lancer le serveur :

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Peupler les données (seed)

Avec le serveur démarré, importer des repositories populaires :

```bash
curl -X POST -H "Authorization: Bearer VOTRE_CRON_SECRET" http://localhost:3000/api/seed
```

Ou visitez directement un repo, ex. [http://localhost:3000/github/vercel/next.js](http://localhost:3000/github/vercel/next.js).

Le **trending** nécessite au moins **2 collectes** par repository (visite + actualisation, ou 2 passages du cron).

## Cron (synchronisation horaire)

Test en local :

```bash
curl -H "Authorization: Bearer VOTRE_CRON_SECRET" http://localhost:3000/api/cron/update
```

Configuration dans [`vercel.json`](vercel.json) : `0 * * * *` (toutes les heures).

**Note Vercel :** le plan Hobby limite les crons (souvent 1/jour). Plan Pro pour un cron horaire, ou gardez un cron quotidien `0 0 * * *` + bouton « Actualiser » sur chaque page repo.

## Déploiement Vercel

1. Pousser le repo sur GitHub et importer dans Vercel
2. Ajouter toutes les variables d'environnement (mêmes noms que `.env.local`)
3. Déployer — le cron s'active automatiquement si `vercel.json` est présent
4. Lancer le seed une fois en production :

```bash
curl -X POST -H "Authorization: Bearer VOTRE_CRON_SECRET" https://votre-app.vercel.app/api/seed
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Recherche, trending preview, derniers repos |
| `/github/[owner]/[repo]` | Stats, graphiques, historique |
| `/trending` | Classements daily / weekly / monthly |

## API

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/search?q=` | GET | Recherche GitHub |
| `/api/repos/[owner]/[repo]` | GET | Repo + historique (`?force=1` pour resync) |
| `/api/cron/update` | GET | Sync tous les repos (auth Bearer) |
| `/api/seed` | POST | Import repos populaires (auth Bearer) |

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur local |
| `npm run build` | Build production |
| `npm run lint` | ESLint |
