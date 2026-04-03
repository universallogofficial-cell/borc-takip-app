import { roundCurrency, toSafeNumber } from "@/lib/financeMath";

export function isClosedDebt(remainingDebt: number | null | undefined) {
  return roundCurrency(toSafeNumber(remainingDebt)) <= 0;
}

export function getDebtLifecycleStatus(
  remainingDebt: number | null | undefined,
) {
  return isClosedDebt(remainingDebt) ? "closed" : "active";
}
