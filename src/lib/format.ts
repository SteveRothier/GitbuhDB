export function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return value.toLocaleString("fr-FR");
}

export function formatGrowthPercent(value: number): string {
  return `${value.toFixed(1).replace(/\.0$/, "")}%`;
}
