import { roundCurrency, toSafeNumber } from "@/lib/financeMath";
import type {
  DebtRow,
  UpcomingPaymentItem,
  UpcomingPaymentStatus,
  UpcomingPaymentSummary,
} from "@/types/finance";

const APPROACHING_DAY_WINDOW = 7;

export function getUpcomingPaymentStatus(
  dueDay: number,
  todayDay: number,
): UpcomingPaymentStatus {
  if (dueDay === todayDay) {
    return "today";
  }

  if (dueDay < todayDay) {
    return "passed";
  }

  if (dueDay - todayDay <= APPROACHING_DAY_WINDOW) {
    return "approaching";
  }

  return "later_this_month";
}

function getSortDistance(dueDay: number, todayDay: number) {
  return dueDay >= todayDay ? dueDay - todayDay : 100 + dueDay;
}

export function buildUpcomingPayments(debts: DebtRow[]) {
  const today = new Date();
  const todayDay = today.getDate();

  const items: UpcomingPaymentItem[] = debts
    .filter((item) => {
      const dueDay = item.due_day;
      const remainingDebt = roundCurrency(toSafeNumber(item.remaining_debt));

      return (
        typeof dueDay === "number" &&
        Number.isInteger(dueDay) &&
        dueDay >= 1 &&
        dueDay <= 31 &&
        remainingDebt > 0
      );
    })
    .map((item) => {
      const dueDay = item.due_day as number;

      return {
        id: item.id,
        debtName: item.name,
        institution: item.institution || "Kurum yok",
        dueDay,
        minimumPayment: roundCurrency(toSafeNumber(item.minimum_payment)),
        remainingDebt: roundCurrency(toSafeNumber(item.remaining_debt)),
        status: getUpcomingPaymentStatus(dueDay, todayDay),
      };
    })
    .sort((a, b) => {
      const distanceDiff =
        getSortDistance(a.dueDay, todayDay) - getSortDistance(b.dueDay, todayDay);

      if (distanceDiff !== 0) {
        return distanceDiff;
      }

      return a.dueDay - b.dueDay;
    });

  const summary: UpcomingPaymentSummary = {
    dueThisMonthCount: items.length,
    totalMinimumPayment: items.reduce(
      (sum, item) => roundCurrency(sum + item.minimumPayment),
      0,
    ),
    urgentCount: items.filter(
      (item) => item.status === "today" || item.status === "approaching",
    ).length,
  };

  return { items, summary };
}
