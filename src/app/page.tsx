import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { RepoSearch } from "@/components/repo-search";
import { RepoCard } from "@/components/repo-card";
import { TrendingTable } from "@/components/trending-table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRecentRepositories } from "@/lib/repositories";
import { getTrendingRepos } from "@/lib/trending";

export default async function Home() {
  const [trending, recent] = await Promise.all([
    getTrendingRepos("daily", 5),
    getRecentRepositories(6),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Suivez l&apos;évolution des{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            repositories GitHub
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          Historisez les stars, visualisez la croissance et découvrez les projets
          tendance.
        </p>
        <RepoSearch className="mx-auto" />
      </section>

      <section className="mb-16">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Trending aujourd&apos;hui</h2>
          <Link
            href="/trending"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <TrendingUp className="size-4" />
            Voir tout
          </Link>
        </div>
        <TrendingTable
          repos={trending}
          emptyMessage="Aucun trending pour le moment. Recherchez des repositories pour commencer à collecter l'historique."
        />
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Derniers ajouts</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
