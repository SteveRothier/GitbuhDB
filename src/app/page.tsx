import { HomeHero } from "@/components/home/hero";
import { HomeRankingsPanel } from "@/components/home/rankings/panel";
import { getHomeDatabaseListsCached } from "@/lib/home-database";

export const dynamic = "force-dynamic";

export default async function Home() {
  const databaseLists = await getHomeDatabaseListsCached();

  return (
    <div className="min-h-screen w-full bg-[#050508]">
      <div className="mx-auto max-w-[1400px] px-4 pb-12 pt-2 sm:px-6 lg:px-8">
        <HomeHero />
        <HomeRankingsPanel data={databaseLists} />
      </div>
    </div>
  );
}
