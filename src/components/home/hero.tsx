import { HeroSearch } from "@/components/home/hero-search";

export function HomeHero() {
  return (
    <section
      id="search"
      className="relative mb-6 overflow-hidden px-4 pb-1 pt-4 text-center sm:pt-5"
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[260px] w-[min(100%,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.22)_0%,rgba(59,130,246,0.08)_40%,transparent_72%)]" />
        <svg
          className="absolute bottom-2 left-1/2 w-full max-w-5xl -translate-x-1/2 opacity-90"
          viewBox="0 0 800 140"
          fill="none"
          preserveAspectRatio="none"
          height={72}
          width="100%"
        >
          <defs>
            <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
              <stop offset="45%" stopColor="#7c3aed" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="heroGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="55%" stopColor="#60a5fa" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 88 C180 30 380 110 560 48 S800 100 800 72"
            stroke="url(#heroGrad)"
            strokeWidth="2.2"
            fill="none"
          />
          <path
            d="M0 102 C220 118 420 42 640 95 S780 55 800 88"
            stroke="url(#heroGrad2)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.85"
          />
        </svg>
      </div>

      <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
        Suivez. Analysez.{" "}
        <span className="bg-gradient-to-r from-violet-400 via-primary to-blue-400 bg-clip-text text-transparent">
          Progressez.
        </span>
      </h1>
      <p className="mx-auto mb-5 max-w-2xl text-sm text-zinc-400 sm:text-base">
        Analysez les statistiques et l&apos;activité de n&apos;importe quel dépôt GitHub
        via l&apos;API officielle.
      </p>

      <HeroSearch />
    </section>
  );
}
