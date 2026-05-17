import Link from "next/link";
import { Search, TrendingUp, BarChart3 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
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
          tendance — inspiré de SteamDB pour l&apos;écosystème open source.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/trending"
            className={cn(buttonVariants({ size: "lg" }), "gap-2")}
          >
            <TrendingUp className="size-4" />
            Voir le trending
          </Link>
          <Button size="lg" variant="outline" disabled>
            <Search className="size-4" />
            Recherche — bientôt
          </Button>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            icon: Search,
            title: "Rechercher",
            description:
              "Trouvez un repository par nom (ex. vercel/next.js) et enregistrez ses statistiques.",
          },
          {
            icon: BarChart3,
            title: "Graphiques",
            description:
              "Visualisez l'évolution des stars et forks dans le temps.",
          },
          {
            icon: TrendingUp,
            title: "Trending",
            description:
              "Classements quotidiens, hebdomadaires et mensuels des repos en croissance.",
          },
        ].map(({ icon: Icon, title, description }) => (
          <Card key={title} className="border-border/60 bg-card/80">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon className="size-5" />
              </div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </section>

      <p className="mt-12 text-center text-sm text-muted-foreground">
        Prochaine étape : connecter Supabase et l&apos;API GitHub. Copiez{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          .env.local.example
        </code>{" "}
        vers{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.env.local</code>
        .
      </p>
    </div>
  );
}
