export function isBlank(value: string) {
  return value.trim() === "";
}

export function parseNumber(value: string): number | null {
  if (isBlank(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseOptionalNumber(value: string): number | null {
  return isBlank(value) ? null : parseNumber(value);
}

export function parseOptionalInteger(value: string): number | null {
  if (isBlank(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}
