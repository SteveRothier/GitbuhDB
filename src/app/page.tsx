import { Flame, BarChart3, Clock, Code2 } from "lucide-react";
import { HomeHero } from "@/components/home/home-hero";
import { DashboardCard } from "@/components/home/dashboard-card";
import { TrendingList } from "@/components/home/trending-list";
import { GrowthList } from "@/components/home/growth-list";
import { RecentList } from "@/components/home/recent-list";
import { LanguagesChart } from "@/components/home/languages-chart";
import { getHomePageData } from "@/lib/home-data";

export default async function Home() {
  const { dailyTrending, weeklyGrowth, recent, languages, usingGitHubFallback } =
    await getHomePageData();

  return (
    <div className="px-4 pb-10 lg:px-8">
      <HomeHero />

      <div className="grid gap-5 lg:grid-cols-2">
        <DashboardCard
          icon={Flame}
          iconClassName="text-orange-500"
          title="Trending aujourd'hui"
          href="/trending?period=daily"
          subtitle={
            usingGitHubFallback
              ? "Basé sur les stars GitHub (historique en cours de collecte)"
              : undefined
          }
        >
          <TrendingList
            repos={dailyTrending}
            usingFallback={usingGitHubFallback}
          />
        </DashboardCard>

        <DashboardCard
          icon={BarChart3}
          iconClassName="text-violet-400"
          title="Top croissance (7 derniers jours)"
          href="/trending?period=weekly"
        >
          <GrowthList
            repos={weeklyGrowth}
            usingFallback={usingGitHubFallback && weeklyGrowth.length > 0}
          />
        </DashboardCard>

        <DashboardCard
          icon={Clock}
          title="Derniers dépôts ajoutés"
          href="/trending"
        >
          <RecentList repos={recent} />
        </DashboardCard>

        <DashboardCard icon={Code2} title="Langages populaires" href="/trending">
          <LanguagesChart languages={languages} />
        </DashboardCard>
      </div>
    </div>
  );
}
