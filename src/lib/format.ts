/** Nombre entier avec séparateurs (ex. 21 547), sans abréviation k/M. */
export function formatExact(value: number | null | undefined): string {
  const n = value ?? 0;
  if (!Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString("fr-FR");
}

export function formatCompact(value: number | null | undefined): string {
  const n = value ?? 0;
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return n.toLocaleString("fr-FR");
}

