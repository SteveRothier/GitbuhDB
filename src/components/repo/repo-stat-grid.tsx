import { AlertCircle, GitFork, Star, Eye, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatCompact, formatExact } from "@/lib/format";
import { cn } from "@/lib/utils";

const card =
  "@container/stat rounded-xl border border-white/[0.06] bg-[#161b22] px-4 py-4 shadow-none transition-colors hover:border-white/[0.1]";

function StatValue({ value }: { value: number }) {
  return (
    <p className="mt-2 min-w-0 text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-[1.65rem]">
      <span className="@[8.5rem]/stat:hidden">{formatCompact(value)}</span>
      <span className="hidden @[8.5rem]/stat:inline">{formatExact(value)}</span>
    </p>
  );
}

function StatCard({
  icon: Icon,
  iconClassName,
  label,
  value,
}: {
  icon: LucideIcon;
  iconClassName: string;
  label: string;
  value: number;
}) {
  return (
    <div className={card}>
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon className={cn("size-4", iconClassName)} aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <StatValue value={value} />
    </div>
  );
}

export function RepoStatGrid({
  stars,
  forks,
  watchers,
  openIssues,
  contributors,
}: {
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  contributors: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard icon={Star} iconClassName="text-amber-400/90" label="Étoiles" value={stars} />
      <StatCard icon={GitFork} iconClassName="text-sky-400/90" label="Forks" value={forks} />
      <StatCard icon={Eye} iconClassName="text-violet-300/90" label="Observateurs" value={watchers} />
      <StatCard
        icon={AlertCircle}
        iconClassName="text-orange-300/90"
        label="Issues ouvertes"
        value={openIssues}
      />
      <StatCard
        icon={Users}
        iconClassName="text-emerald-400/90"
        label="Contributeurs"
        value={contributors}
      />
    </div>
  );
}
