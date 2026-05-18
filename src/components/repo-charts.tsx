"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { RepositoryHistory } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RepoChartsProps = {
  history: RepositoryHistory[];
};

function formatDate(iso: string) {
  return format(new Date(iso), "d MMM", { locale: fr });
}

function buildChartData(history: RepositoryHistory[]) {
  return history.map((entry, index) => {
    const prev = index > 0 ? history[index - 1] : null;
    const dailyGrowth = prev ? entry.stars - prev.stars : 0;

    return {
      date: formatDate(entry.collected_at),
      stars: entry.stars,
      forks: entry.forks,
      dailyGrowth: Math.max(0, dailyGrowth),
    };
  });
}

export function RepoCharts({ history }: RepoChartsProps) {
  if (history.length < 2) {
    return (
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>Historique</CardTitle>
          <CardDescription>
            Pas encore assez de données. Revenez après la prochaine collecte ou
            actualisez le repository.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const data = buildChartData(history);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border/60 bg-card/80 lg:col-span-2">
        <CardHeader>
          <CardTitle>Stars dans le temps</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer height={280}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
              />
              <Line
                type="monotone"
                dataKey="stars"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                name="Stars"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>Forks dans le temps</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer height={220}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
              />
              <Line
                type="monotone"
                dataKey="forks"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                name="Forks"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>Croissance quotidienne (stars)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer height={220}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
              />
              <Area
                type="monotone"
                dataKey="dailyGrowth"
                stroke="#6366f1"
                fill="#6366f140"
                name="Nouvelles stars"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function ChartContainer({
  children,
  height,
}: {
  children: React.ReactElement;
  height: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  );
}
