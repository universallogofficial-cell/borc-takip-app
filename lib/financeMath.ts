export function toSafeNumber(value: unknown): number {
  const parsed =
    typeof value === "number" ? value : Number(value === null ? 0 : value);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function roundCurrency(value: number): number {
  return Math.round((toSafeNumber(value) + Number.EPSILON) * 100) / 100;
}
