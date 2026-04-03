import { roundCurrency, toSafeNumber } from "@/lib/financeMath";
import type {
  CashItem,
  CashRiskSummary,
  DataHealthSummary,
  DebtRow,
  OperationsOverviewSummary,
  Payment,
} from "@/types/finance";

export function buildOperationsOverviewSummary({
  debts,
  cashList,
  payments,
  upcomingPaymentCount,
  cashRisk,
}: {
  debts: DebtRow[];
  cashList: CashItem[];
  payments: Payment[];
  upcomingPaymentCount: number;
  cashRisk: CashRiskSummary;
}): OperationsOverviewSummary {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const todayPaymentCount = payments.filter((item) => {
    const date = new Date(item.created_at);
    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }).length;

  const last7DaysPaymentCount = payments.filter((item) => {
    const date = new Date(item.created_at);
    return !Number.isNaN(date.getTime()) && date >= sevenDaysAgo;
  }).length;

  const thisMonthPaymentAmount = roundCurrency(
    payments.reduce((sum, item) => {
      const date = new Date(item.created_at);
      const isThisMonth =
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth();

      if (!isThisMonth) {
        return sum;
      }

      return roundCurrency(sum + toSafeNumber(item.amount));
    }, 0),
  );

  const totalDebtCount = debts.length;
  const activeDebtCount = debts.filter((item) => toSafeNumber(item.remaining_debt) > 0).length;
  const closedDebtCount = totalDebtCount - activeDebtCount;

  return {
    totalDebtCount,
    activeDebtCount,
    closedDebtCount,
    totalCashAccountCount: cashList.length,
    totalPaymentCount: payments.length,
    todayPaymentCount,
    last7DaysPaymentCount,
    thisMonthPaymentAmount,
    upcomingPaymentCount,
    hasRisk: cashRisk.isInsufficient || cashRisk.warnings.length > 0,
  };
}

export function buildDataHealthSummary({
  debts,
  cashList,
  payments,
}: {
  debts: DebtRow[];
  cashList: CashItem[];
  payments: Payment[];
}): DataHealthSummary {
  const debtIds = new Set(debts.map((item) => item.id));
  const cashIds = new Set(cashList.map((item) => item.id));

  const negativeRemainingDebtCount = debts.filter(
    (item) => toSafeNumber(item.remaining_debt) < 0,
  ).length;
  const negativeCashBalanceCount = cashList.filter(
    (item) => toSafeNumber(item.balance) < 0,
  ).length;
  const missingPaymentRelationCount = payments.filter(
    (item) => !debtIds.has(item.debt_id) || !cashIds.has(item.cash_id),
  ).length;
  const invalidDueDayCount = debts.filter((item) => {
    if (item.due_day === null) {
      return false;
    }

    return (
      !Number.isInteger(item.due_day) ||
      item.due_day < 1 ||
      item.due_day > 31
    );
  }).length;

  return {
    negativeRemainingDebtCount,
    negativeCashBalanceCount,
    missingPaymentRelationCount,
    invalidDueDayCount,
    hasIssues:
      negativeRemainingDebtCount > 0 ||
      negativeCashBalanceCount > 0 ||
      missingPaymentRelationCount > 0 ||
      invalidDueDayCount > 0,
  };
}

export function buildRecommendedActions({
  health,
  cashRisk,
  upcomingUrgentCount,
  closedDebtCount,
}: {
  health: DataHealthSummary;
  cashRisk: CashRiskSummary;
  upcomingUrgentCount: number;
  closedDebtCount: number;
}) {
  const actions: string[] = [];

  if (health.negativeRemainingDebtCount > 0) {
    actions.push(
      `${health.negativeRemainingDebtCount} borç kaydında negatif kalan borç görünüyor.`,
    );
  }

  if (health.negativeCashBalanceCount > 0) {
    actions.push(
      `${health.negativeCashBalanceCount} kasada negatif bakiye tespit edildi.`,
    );
  }

  if (health.missingPaymentRelationCount > 0) {
    actions.push(
      `${health.missingPaymentRelationCount} ödeme kaydında ilişki kontrolü gerekiyor.`,
    );
  }

  if (health.invalidDueDayCount > 0) {
    actions.push(
      `${health.invalidDueDayCount} borç kaydında ödeme günü değeri geçersiz.`,
    );
  }

  if (cashRisk.isInsufficient) {
    actions.push("Yakın dönem minimum ödeme yükü mevcut nakdi aşıyor.");
  }

  if (upcomingUrgentCount >= 2) {
    actions.push(`${upcomingUrgentCount} yaklaşan ödeme için plan oluşturun.`);
  }

  if (closedDebtCount > 0) {
    actions.push(`${closedDebtCount} kapanmış borç arşivde bekliyor.`);
  }

  if (actions.length === 0) {
    actions.push("Kritik operasyonel uyarı görünmüyor.");
  }

  return actions.slice(0, 5);
}
