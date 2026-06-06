export function parsePage(value: string | string[] | undefined): number {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function queryValue(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function formatProbability(value: number | null): string {
  return value === null
    ? "—"
    : new Intl.NumberFormat("en", {
        style: "percent",
        maximumFractionDigits: 1
      }).format(value);
}
