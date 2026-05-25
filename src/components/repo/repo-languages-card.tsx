"use client";

import { Code2 } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { REPO_CARD, REPO_PANEL_BODY } from "@/components/repo/repo-panel-layout";
import type { LanguageShare } from "@/lib/types";

const TOOLTIP_STYLE = {
  background: "#0f1419",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "#fafafa",
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#38bdf8",
  JavaScript: "#eab308",
  CSS: "#a855f7",
  HTML: "#f97316",
  Rust: "#f97316",
  Python: "#22c55e",
  Go: "#22d3ee",
  Java: "#ef4444",
  Ruby: "#f43f5e",
  PHP: "#8b5cf6",
  Shell: "#a1a1aa",
  Vue: "#22c55e",
  Svelte: "#ef4444",
  Kotlin: "#a855f7",
  Swift: "#f97316",
  C: "#64748b",
  "C++": "#64748b",
  "C#": "#8b5cf6",
};

const OTHER_COLOR = "#71717a";

const PERCENT_COLORS: Record<string, string> = {
  TypeScript: "text-sky-300",
  JavaScript: "text-amber-200",
  CSS: "text-violet-300",
  HTML: "text-orange-300",
  Autres: "text-zinc-300",
};

type LangSlice = { name: string; percent: number; color: string };

function colorForLang(name: string): string {
  return LANG_COLORS[name] ?? OTHER_COLOR;
}

function percentColor(name: string): string {
  return PERCENT_COLORS[name] ?? "text-zinc-300";
}

function buildSlices(languages: LanguageShare[]): LangSlice[] {
  if (languages.length === 0) return [];

  const top = languages.slice(0, 4);
  const rest = languages.slice(4);
  const slices: LangSlice[] = top.map((l) => ({
    name: l.name,
    percent: l.percent,
    color: colorForLang(l.name),
  }));

  if (rest.length > 0) {
    const autresPercent = Math.round(rest.reduce((s, l) => s + l.percent, 0) * 10) / 10;
    if (autresPercent > 0) {
      slices.push({ name: "Autres", percent: autresPercent, color: OTHER_COLOR });
    }
  }

  return slices;
}

export function RepoLanguagesCard({ languages }: { languages: LanguageShare[] }) {
  const slices = buildSlices(languages);
  const hasData = slices.length > 0;

  return (
    <div className={REPO_CARD} aria-label="Distribution des langages">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <Code2 className="size-4 shrink-0 text-zinc-500" aria-hidden />
        <h3 className="text-sm font-medium text-zinc-200">Distribution des langages</h3>
      </div>

      {hasData ? (
        <div
          className={`${REPO_PANEL_BODY} flex-row items-center gap-2 px-3 py-3 sm:gap-4 sm:px-4`}
        >
          <div className="h-[200px] min-w-0 flex-1 sm:h-[220px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="percent"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="88%"
                  paddingAngle={2}
                  stroke="transparent"
                >
                  {slices.map((slice) => (
                    <Cell key={slice.name} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const p = payload[0].payload as LangSlice;
                    return (
                      <div style={TOOLTIP_STYLE} className="px-3 py-2 text-xs">
                        <p className="font-semibold text-white">{p.name}</p>
                        <p className="mt-0.5 text-zinc-400">{p.percent}%</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="flex w-[42%] shrink-0 flex-col justify-center gap-2.5 sm:w-[38%]">
            {slices.map((slice) => (
              <li key={slice.name} className="flex items-center gap-2 text-xs">
                <span
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: slice.color }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-zinc-300">{slice.name}</span>
                <span className={`shrink-0 tabular-nums font-medium ${percentColor(slice.name)}`}>
                  {slice.percent}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className={`${REPO_PANEL_BODY} items-center justify-center px-6 text-center`}>
          <p className="text-sm text-zinc-400">Aucune donnée de langage disponible.</p>
        </div>
      )}
    </div>
  );
}
