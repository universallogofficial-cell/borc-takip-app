import { roundCurrency } from "@/lib/financeMath";
import type { CurrencyCode } from "@/types/finance";

export function formatCurrency(
  value: number,
  currencyCode: CurrencyCode = "TRY",
) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(roundCurrency(value));
}

export function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tarih yok";
  }

  return date.toLocaleString("tr-TR");
}

export function formatTextValue(
  value: string | null | undefined,
  fallback = "Bilgi yok",
) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : fallback;
}

export function getCurrencyLabel(currencyCode: CurrencyCode) {
  if (currencyCode === "USD") {
    return "Amerikan Doları (USD)";
  }

  if (currencyCode === "EUR") {
    return "Euro (EUR)";
  }

  return "Türk Lirası (TRY)";
}
