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

2. Renseigner `.env.local` (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_TOKEN`, `CRON_SECRET`).

3. Exécuter la migration SQL dans le dashboard Supabase :
   `supabase/migrations/001_initial_schema.sql`

4. Lancer le serveur de développement :

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Structure

```
src/
  app/              # Pages et routes API
  components/       # UI (shadcn + composants site)
  lib/
    supabase/       # Clients Supabase (browser, server, admin)
supabase/migrations/  # Schéma PostgreSQL
```

## Scripts

| Commande      | Description        |
|---------------|--------------------|
| `npm run dev` | Serveur local      |
| `npm run build` | Build production |
| `npm run lint` | ESLint            |
