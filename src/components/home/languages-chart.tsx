"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { LanguageStat } from "@/lib/types";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3b82f6",
  JavaScript: "#eab308",
  Python: "#22d3ee",
  Rust: "#f97316",
  Go: "#06b6d4",
  Java: "#ef4444",
  Ruby: "#f43f5e",
  Autres: "#71717a",
};

function getColor(language: string, index: number): string {
  return (
    LANGUAGE_COLORS[language] ??
    ["#8b5cf6", "#6366f1", "#ec4899", "#14b8a6", "#84cc16"][index % 5]
  );
}

type LanguagesChartProps = {
  languages: LanguageStat[];
};

export function LanguagesChart({ languages }: LanguagesChartProps) {
  if (languages.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Ajoutez des repositories pour voir la répartition des langages.
      </p>
    );
  }

  const chartData = languages.map((item, index) => ({
    name: item.language,
    value: item.count,
    percent: item.percent,
    fill: getColor(item.language, index),
  }));

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, item) => {
                const payload = item?.payload as { percent: number; name: string };
                const count = typeof value === "number" ? value : 0;
                return [
                  `${count} repos (${payload?.percent?.toFixed(1) ?? 0}%)`,
                  payload?.name ?? "",
                ];
              }}
              contentStyle={{
                background: "#111827",
                border: "1px solid #27272a",
                borderRadius: "8px",
                color: "#fafafa",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 space-y-2 text-sm">
        {chartData.map((item) => (
          <li key={item.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span
                className="size-3 shrink-0 rounded-sm"
                style={{ backgroundColor: item.fill }}
              />
              {item.name}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {item.percent.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
