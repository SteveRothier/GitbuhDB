import { HeroSearch } from "@/components/home/hero-search";

export function HomeHero() {
  return (
    <section
      id="search"
      className="relative mb-10 overflow-hidden px-4 pb-4 pt-8 text-center sm:pt-12"
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[min(100%,900px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.25)_0%,transparent_70%)]" />
        <svg
          className="absolute bottom-4 left-1/2 w-full max-w-4xl -translate-x-1/2 text-violet-500/40"
          viewBox="0 0 800 120"
          fill="none"
          preserveAspectRatio="none"
          height={100}
          width="100%"
        >
          <path
            d="M0 80 C200 20 400 100 600 50 S800 90 800 60"
            stroke="url(#heroGrad)"
            strokeWidth="2"
            fill="none"
          />
          <defs>
            <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
              <stop offset="50%" stopColor="#7c3aed" stopOpacity="1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        Suivez. Analysez.{" "}
        <span className="bg-gradient-to-r from-violet-400 via-primary to-blue-400 bg-clip-text text-transparent">
          Progressez.
        </span>
      </h1>
      <p className="mx-auto mb-10 max-w-2xl text-base text-muted-foreground sm:text-lg">
        Analysez les statistiques de n&apos;importe quel dépôt GitHub. Historique,
        tendances, croissance et bien plus.
      </p>

      <HeroSearch />
    </section>
  );
}
