import { RankingsTable } from "@/components/home/rankings/ranking-table";
import type { HomeDatabaseLists } from "@/lib/types";

type HomeRankingsPanelProps = {
  data: HomeDatabaseLists;
};

export function HomeRankingsPanel({ data }: HomeRankingsPanelProps) {
  if (!data.hasToken) {
    return (
      <div className="rounded-[10px] bg-[#0d0d12] px-4 py-8 text-center ring-1 ring-inset ring-white/[0.04]">
        <p className="text-sm text-[#9ca3af]">
          Configurez <code className="text-zinc-300">GITHUB_TOKEN</code> dans{" "}
          <code className="text-zinc-300">.env.local</code> pour afficher les classements live.
        </p>
      </div>
    );
  }

  const mainEmpty = data.topStars.length === 0 && data.topCreated30d.length === 0;

  if (mainEmpty) {
    return (
      <p className="rounded-[10px] bg-[#0d0d12] px-4 py-8 text-center text-sm text-[#9ca3af] ring-1 ring-inset ring-white/[0.04]">
        Impossible de charger les classements. Vérifiez le token ou réessayez plus tard.
      </p>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <RankingsTable title="Top étoiles" repos={data.topStars} />
      <RankingsTable
        title="Populaire ces 30 derniers jours"
        repos={data.topCreated30d}
        emptyMessage={"Aucun dépôt créé récemment avec assez d'étoiles."}
      />
    </div>
  );
}
