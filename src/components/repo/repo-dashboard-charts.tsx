"use client";

import type { ComponentProps, ComponentType, ReactNode } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  GitCommit,
  GitPullRequest,
  AlertTriangle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RepoDetailsCard } from "@/components/repo/repo-detail-footer";
import { RepoLanguagesCard } from "@/components/repo/repo-languages-card";
import { RepoRecentIssuesCard } from "@/components/repo/repo-recent-issues-card";
import { RepoRecentPullsCard } from "@/components/repo/repo-recent-pulls-card";
import { RepoRecentReleasesCard } from "@/components/repo/repo-recent-releases-card";
import { REPO_CARD } from "@/components/repo/repo-panel-layout";
import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  RecentIssue,
  RecentPull,
  RecentRelease,
  RepoGitHubActivity,
  RepoPageExtras,
} from "@/lib/types";

const GRID_STROKE = "rgba(255,255,255,0.05)";
const TICK = { fill: "#71717a", fontSize: 11 };
const GRID_CLASS = "grid auto-rows-fr gap-4 sm:grid-cols-2 items-stretch";
const TOOLTIP_STYLE = {
  background: "#0f1419",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "#fafafa",
};

type ActivityChartRow = {
  dayIso: string;
  label: string;
  tooltipDate: string;
  value: number;
  commits?: number;
  issues?: number;
  prs?: number;
  prsDraft?: number;
  prsOpen?: number;
  issuesClosed?: number;
};

function formatTooltipDate(dayIso: string): string {
  if (!dayIso) return "—";
  const d = new Date(dayIso);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "EEEE d MMMM yyyy", { locale: fr });
}

function formatXTick(label: string, index: number, total: number): string {
  if (index === 0 || index === total - 1) {
    const parts = label.split(" ");
    if (parts.length >= 2) {
      const year = new Date().getUTCFullYear();
      return `${label} ${String(year).slice(-2)}`;
    }
  }
  return label;
}

function xAxisInterval(pointCount: number): number | "preserveStartEnd" {
  if (pointCount <= 1) return 0;
  if (pointCount <= 10) return 0;
  if (pointCount <= 20) return 1;
  return Math.max(0, Math.floor(pointCount / 6));
}

type RechartsTooltipContent = NonNullable<ComponentProps<typeof Tooltip>["content"]>;

function renderActivityTooltip(label: string): RechartsTooltipContent {
  const Content = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: readonly { value?: unknown; payload?: ActivityChartRow }[];
  }) => {
    if (!active || !payload?.[0]?.payload) return null;
    const p = payload[0].payload;
    const raw = payload[0].value;
    const n = typeof raw === "number" ? raw : Number(raw);
    return (
      <div style={TOOLTIP_STYLE} className="px-3 py-2 text-xs">
        <p className="text-zinc-400">{p.tooltipDate}</p>
        <p className="mt-1 font-semibold text-white">
          {label} : {Number.isFinite(n) ? formatCompact(n) : "—"}
        </p>
      </div>
    );
  };
  return Content as RechartsTooltipContent;
}

function renderIssuesBarTooltip(): RechartsTooltipContent {
  const Content = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: readonly { dataKey?: string; value?: unknown; payload?: ActivityChartRow }[];
  }) => {
    if (!active || !payload?.[0]?.payload) return null;
    const p = payload[0].payload;
    const updated = Number(payload.find((e) => e.dataKey === "issues")?.value ?? 0);
    const closed = Number(payload.find((e) => e.dataKey === "issuesClosed")?.value ?? 0);
    return (
      <div style={TOOLTIP_STYLE} className="px-3 py-2 text-xs">
        <p className="text-zinc-400">{p.tooltipDate}</p>
        <p className="mt-1 font-semibold text-sky-300">
          Ouvertes : {formatCompact(updated)}
        </p>
        <p className="mt-0.5 font-semibold text-orange-300">
          Fermées : {formatCompact(closed)}
        </p>
      </div>
    );
  };
  return Content as RechartsTooltipContent;
}

function renderPrsBarTooltip(): RechartsTooltipContent {
  const Content = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: readonly { dataKey?: string; value?: unknown; payload?: ActivityChartRow }[];
  }) => {
    if (!active || !payload?.[0]?.payload) return null;
    const p = payload[0].payload;
    const draft = Number(payload.find((e) => e.dataKey === "prsDraft")?.value ?? 0);
    const open = Number(payload.find((e) => e.dataKey === "prsOpen")?.value ?? 0);
    return (
      <div style={TOOLTIP_STYLE} className="px-3 py-2 text-xs">
        <p className="text-zinc-400">{p.tooltipDate}</p>
        <p className="mt-1 font-semibold text-zinc-300">
          Brouillon : {formatCompact(draft)}
        </p>
        <p className="mt-0.5 font-semibold text-emerald-300">
          Ouvertes : {formatCompact(open)}
        </p>
      </div>
    );
  };
  return Content as RechartsTooltipContent;
}

function ActivityAlert({ message, className }: { message: string; className?: string }) {
  return (
    <div
      className={cn(`${REPO_CARD} items-start gap-3 px-4 py-4`, className)}
      role="alert"
    >
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-400" aria-hidden />
      <p className="text-sm text-zinc-300">{message}</p>
    </div>
  );
}

function ChartShell({
  title,
  icon: Icon,
  children,
  emptyMessage,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  emptyMessage?: string;
}) {
  const ariaLabel = `${title}, activité sur 14 jours`;
  return (
    <div className={REPO_CARD} aria-label={ariaLabel}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-4 shrink-0 text-zinc-500" aria-hidden />
          <h3 className="text-sm font-medium text-zinc-200">{title}</h3>
        </div>
        <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
          14 jours
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-2 pb-3 pt-2">
        {emptyMessage ? (
          <div className="flex flex-1 items-center justify-center px-6 text-center">
            <p className="text-sm text-zinc-400">{emptyMessage}</p>
          </div>
        ) : (
          <div className="h-[220px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              {children}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityAreaChart({
  data,
  dataKey,
  stroke,
  gradientId,
  gradientColor,
  tooltipLabel,
}: {
  data: ActivityChartRow[];
  dataKey: string;
  stroke: string;
  gradientId: string;
  gradientColor: string;
  tooltipLabel: string;
}) {
  const interval = xAxisInterval(data.length);
  const showDot = data.length <= 14;

  return (
    <AreaChart data={data}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradientColor} stopOpacity={0.4} />
          <stop offset="100%" stopColor={gradientColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
      <XAxis
        dataKey="label"
        tick={TICK}
        axisLine={false}
        tickLine={false}
        interval={interval}
        minTickGap={28}
        tickFormatter={(value, index) => formatXTick(String(value), index, data.length)}
      />
      <YAxis
        tick={TICK}
        axisLine={false}
        tickLine={false}
        width={44}
        allowDecimals={false}
        domain={[0, "auto"]}
        tickFormatter={(v) => formatCompact(Number(v))}
      />
      <Tooltip content={renderActivityTooltip(tooltipLabel)} />
      <Area
        type="monotone"
        dataKey={dataKey}
        stroke={stroke}
        fill={`url(#${gradientId})`}
        strokeWidth={2}
        dot={showDot ? { r: 2, fill: stroke } : false}
        activeDot={{ r: 4, fill: stroke }}
        name={tooltipLabel}
      />
    </AreaChart>
  );
}

function ActivityIssuesBarChart({ data }: { data: ActivityChartRow[] }) {
  const interval = xAxisInterval(data.length);

  return (
    <BarChart data={data} barCategoryGap="18%" barGap={4}>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
      <XAxis
        dataKey="label"
        tick={TICK}
        axisLine={false}
        tickLine={false}
        interval={interval}
        minTickGap={28}
        tickFormatter={(value, index) => formatXTick(String(value), index, data.length)}
      />
      <YAxis
        tick={TICK}
        axisLine={false}
        tickLine={false}
        width={44}
        allowDecimals={false}
        domain={[0, "auto"]}
        tickFormatter={(v) => formatCompact(Number(v))}
      />
      <Tooltip
        content={renderIssuesBarTooltip()}
        cursor={false}
        animationDuration={220}
        animationEasing="ease-out"
        wrapperStyle={{
          transition: "left 220ms ease-out, top 220ms ease-out",
          outline: "none",
          pointerEvents: "none",
        }}
      />
      <Legend
        verticalAlign="top"
        align="right"
        iconType="square"
        iconSize={8}
        wrapperStyle={{ fontSize: 11, paddingBottom: 4, color: "#a1a1aa" }}
      />
      <Bar
        dataKey="issues"
        name="Ouvertes"
        fill="#38bdf8"
        fillOpacity={0.9}
        activeBar={{ fill: "#67d4fc", fillOpacity: 1 }}
        radius={[3, 3, 0, 0]}
        maxBarSize={28}
      />
      <Bar
        dataKey="issuesClosed"
        name="Fermées"
        fill="#f97316"
        fillOpacity={0.9}
        activeBar={{ fill: "#fb923c", fillOpacity: 1 }}
        radius={[3, 3, 0, 0]}
        maxBarSize={28}
      />
    </BarChart>
  );
}

function ActivityPrsBarChart({ data }: { data: ActivityChartRow[] }) {
  const interval = xAxisInterval(data.length);

  return (
    <BarChart data={data} barCategoryGap="18%" barGap={4}>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
      <XAxis
        dataKey="label"
        tick={TICK}
        axisLine={false}
        tickLine={false}
        interval={interval}
        minTickGap={28}
        tickFormatter={(value, index) => formatXTick(String(value), index, data.length)}
      />
      <YAxis
        tick={TICK}
        axisLine={false}
        tickLine={false}
        width={44}
        allowDecimals={false}
        domain={[0, "auto"]}
        tickFormatter={(v) => formatCompact(Number(v))}
      />
      <Tooltip
        content={renderPrsBarTooltip()}
        cursor={false}
        animationDuration={220}
        animationEasing="ease-out"
        wrapperStyle={{
          transition: "left 220ms ease-out, top 220ms ease-out",
          outline: "none",
          pointerEvents: "none",
        }}
      />
      <Legend
        verticalAlign="top"
        align="right"
        iconType="square"
        iconSize={8}
        wrapperStyle={{ fontSize: 11, paddingBottom: 4, color: "#a1a1aa" }}
      />
      <Bar
        dataKey="prsDraft"
        name="Brouillon"
        fill="#71717a"
        fillOpacity={0.9}
        activeBar={{ fill: "#a1a1aa", fillOpacity: 1 }}
        radius={[3, 3, 0, 0]}
        maxBarSize={28}
      />
      <Bar
        dataKey="prsOpen"
        name="Ouvertes"
        fill="#22c55e"
        fillOpacity={0.9}
        activeBar={{ fill: "#4ade80", fillOpacity: 1 }}
        radius={[3, 3, 0, 0]}
        maxBarSize={28}
      />
    </BarChart>
  );
}

function mapActivityRows(
  activity: RepoGitHubActivity,
  key: "commits" | "issues" | "prs" | "issuesClosed",
): ActivityChartRow[] {
  return activity.daily.map((d) => ({
    dayIso: d.dayIso,
    label: d.dayLabel,
    tooltipDate: formatTooltipDate(d.dayIso),
    value: d[key],
    [key]: d[key],
  }));
}

function activityErrorMessage(activity: RepoGitHubActivity): string | null {
  if (activity.status === "no_token") {
    return "Configurez GITHUB_TOKEN dans .env.local pour afficher l’activité des 14 derniers jours.";
  }
  if (activity.status === "error") {
    return "Impossible de charger l’activité GitHub pour ce dépôt. Réessayez plus tard.";
  }
  return null;
}

type RepoDashboardChartsProps = {
  activity: RepoGitHubActivity;
  language: string | null;
  extras: RepoPageExtras;
  recentReleases: RecentRelease[];
  recentIssues: RecentIssue[];
  recentPulls: RecentPull[];
  issuesUrl: string;
  releasesUrl: string;
  pullsUrl: string;
};

export function RepoDashboardCharts({
  activity,
  language,
  extras,
  recentReleases,
  recentIssues,
  recentPulls,
  issuesUrl,
  releasesUrl,
  pullsUrl,
}: RepoDashboardChartsProps) {
  const errorMessage = activityErrorMessage(activity);
  const commitsData = mapActivityRows(activity, "commits");
  const issuesBarData = mapActivityRows(activity, "issues").map((row, i) => ({
    ...row,
    issuesClosed: activity.daily[i]?.issuesClosed ?? 0,
  }));
  const prsBarData = activity.daily.map((d) => ({
    dayIso: d.dayIso,
    label: d.dayLabel,
    tooltipDate: formatTooltipDate(d.dayIso),
    value: d.prs,
    prs: d.prs,
    prsDraft: d.prsDraft,
    prsOpen: d.prsOpen,
  }));

  const hasCommits = activity.status === "ok" && activity.daily.some((d) => d.commits > 0);
  const hasIssues =
    activity.status === "ok" &&
    activity.daily.some((d) => d.issues > 0 || d.issuesClosed > 0);
  const hasPrs =
    activity.status === "ok" &&
    activity.daily.some((d) => d.prsDraft > 0 || d.prsOpen > 0);

  const emptyMessage = "Peu ou pas d’activité sur cette période.";

  if (errorMessage) {
    return (
      <div className={GRID_CLASS}>
        <ActivityAlert message={errorMessage} className="sm:col-span-2" />
        <RepoLanguagesCard languages={extras.languages} />
        <RepoDetailsCard language={language} extras={extras} />
      </div>
    );
  }

  return (
    <div className={GRID_CLASS}>
      {activity.activityTruncated ? (
        <ActivityAlert
          message="Activité partielle sur 14 jours — ce dépôt est très actif (limite de pagination API)."
          className="sm:col-span-2"
        />
      ) : null}
      <ChartShell
        title="Commits"
        icon={GitCommit}
        emptyMessage={hasCommits ? undefined : emptyMessage}
      >
        {hasCommits ? (
          <ActivityAreaChart
            data={commitsData}
            dataKey="commits"
            stroke="#a855f7"
            gradientId="repoCommitsPurple"
            gradientColor="#a855f7"
            tooltipLabel="Commits"
          />
        ) : null}
      </ChartShell>

      <RepoRecentReleasesCard releases={recentReleases} releasesUrl={releasesUrl} />

      <ChartShell
        title="Issues ouvertes / fermées"
        icon={AlertCircle}
        emptyMessage={hasIssues ? undefined : emptyMessage}
      >
        {hasIssues ? <ActivityIssuesBarChart data={issuesBarData} /> : null}
      </ChartShell>

      <RepoRecentIssuesCard issues={recentIssues} issuesUrl={issuesUrl} />

      <ChartShell
        title="Pull requests brouillon / ouvertes"
        icon={GitPullRequest}
        emptyMessage={hasPrs ? undefined : emptyMessage}
      >
        {hasPrs ? <ActivityPrsBarChart data={prsBarData} /> : null}
      </ChartShell>

      <RepoRecentPullsCard pulls={recentPulls} pullsUrl={pullsUrl} />

      <RepoLanguagesCard languages={extras.languages} />
      <RepoDetailsCard language={language} extras={extras} />
    </div>
  );
}
