# GitHub Tracker

Suivi simplifié des dépôts GitHub : recherche, classements sur l’accueil (Search API), fiche dépôt avec stats live et activité commits / issues / PR (14 jours).

## Stack

- **Next.js 16** (App Router, TypeScript)
- **GitHub REST + Search API** (seule source de données)
- **Recharts** (graphiques d’activité)

## Démarrage

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | **Requis** pour Search et quotas corrects |

## Architecture

```text
Accueil (recherche + classements) →  GitHub Search (top étoiles, populaires 30j)
/github/owner/repo               →  REST /repos + Search (activité 14j, cache 1h)
GET /api/repos/...?force=1       →  invalide le cache activité + refresh
```

Aucune base de données ni cron : tout est chargé à la demande depuis GitHub.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Recherche + classements (top étoiles, populaires 30 j) |
| `/github/[owner]/[repo]` | Stats REST + graphiques commits / issues / PR (14 j) |

## API

| Route | Description |
|-------|-------------|
| `GET /api/search?q=` | Recherche GitHub |
| `GET /api/repos/[owner]/[repo]` | Repo live + activité (`?force=1` pour rafraîchir le cache Search) |

## Limites

- Les totaux Search sont des **estimations** (`total_count`), pas des comptages exhaustifs.
- La fiche dépôt déclenche ~42 requêtes Search (14 j × 3 métriques), mises en cache 1 h.
- Pas de courbe historique stars/forks : l’API GitHub ne publie pas ces séries temporelles.

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur local |
| `npm run build` | Build production |
| `npm run lint` | ESLint |
| `npm run verify:indexation` | Vérifie `GITHUB_TOKEN` |
