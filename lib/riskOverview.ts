import { roundCurrency, toSafeNumber } from "@/lib/financeMath";
import type {
  CashRiskSummary,
  DebtPriorityItem,
  DebtRow,
  MonthlyPerformanceSummary,
} from "@/types/finance";

function getDueUrgencyScore(dueDay: number | null, todayDay: number) {
  if (dueDay === null) {
    return 0;
  }

  if (dueDay === todayDay) {
    return 80;
  }

  if (dueDay < todayDay) {
    return 55;
  }

  if (dueDay - todayDay <= 3) {
    return 60;
  }

  if (dueDay - todayDay <= 7) {
    return 35;
  }

  return 10;
}

function buildPrioritySummary(reasons: string[]) {
  if (reasons.length === 0) {
    return "Mevcut ödeme baskısına göre izlenmesi gereken borç.";
  }

  if (reasons.length === 1) {
    return `${reasons[0]} nedeniyle öne çıkıyor.`;
  }

  if (reasons.length === 2) {
    return `${reasons[0]} ve ${reasons[1]} nedeniyle öne çıkıyor.`;
  }

  return `${reasons[0]}, ${reasons[1]} ve ${reasons[2]} nedeniyle öncelikli.`;
}

export function buildDebtPriorityItems(debts: DebtRow[]): DebtPriorityItem[] {
  const todayDay = new Date().getDate();
  const activeDebts = debts.filter((item) => toSafeNumber(item.remaining_debt) > 0);

  if (activeDebts.length === 0) {
    return [];
  }

  const averageMinimumPayment =
    activeDebts.reduce(
      (sum, item) => sum + roundCurrency(toSafeNumber(item.minimum_payment)),
      0,
    ) / activeDebts.length;
  const averageRemainingDebt =
    activeDebts.reduce(
      (sum, item) => sum + roundCurrency(toSafeNumber(item.remaining_debt)),
      0,
    ) / activeDebts.length;

  return activeDebts
    .map((item) => {
      const remainingDebt = roundCurrency(toSafeNumber(item.remaining_debt));
      const minimumPayment = roundCurrency(toSafeNumber(item.minimum_payment));
      const rate = toSafeNumber(item.rate);
      const dueDay = item.due_day;
      const reasons: string[] = [];
      let score = getDueUrgencyScore(dueDay, todayDay);

      if (dueDay === todayDay) {
        reasons.push("bugün kritik");
      } else if (dueDay !== null && (dueDay < todayDay || dueDay - todayDay <= 3)) {
        reasons.push("ödeme günü çok yakın");
      }

      if (rate >= 4) {
        score += 25;
        reasons.push("faiz yüksek");
      }

      if (minimumPayment > 0 && minimumPayment >= averageMinimumPayment * 1.2) {
        score += 20;
        reasons.push("minimum ödeme yüksek");
      }

      if (remainingDebt >= averageRemainingDebt * 1.2) {
        score += 15;
        reasons.push("büyük kalan borç");
      }

      return {
        id: item.id,
        debtName: item.name,
        institution: item.institution || "Kurum yok",
        remainingDebt,
        minimumPayment,
        dueDay,
        score,
        reasons: reasons.slice(0, 3),
        summary: buildPrioritySummary(reasons.slice(0, 3)),
      };
    })
    .sort((a, b) => b.score - a.score || b.remainingDebt - a.remainingDebt)
    .slice(0, 5);
}

export function buildCashRiskSummary(
  debts: DebtRow[],
  currentCash: number,
): CashRiskSummary {
  const todayDay = new Date().getDate();
  const monthlyMinimumLoad = roundCurrency(
    debts.reduce((sum, item) => {
      const remainingDebt = roundCurrency(toSafeNumber(item.remaining_debt));
      const minimumPayment = roundCurrency(toSafeNumber(item.minimum_payment));

      if (remainingDebt <= 0 || minimumPayment <= 0) {
        return sum;
      }

      return roundCurrency(sum + minimumPayment);
    }, 0),
  );
  const nearTermObligation = roundCurrency(
    debts.reduce((sum, item) => {
      const remainingDebt = roundCurrency(toSafeNumber(item.remaining_debt));
      const minimumPayment = roundCurrency(toSafeNumber(item.minimum_payment));
      const dueDay = item.due_day;

      if (
        remainingDebt <= 0 ||
        minimumPayment <= 0 ||
        dueDay === null ||
        dueDay < 1 ||
        dueDay > 31
      ) {
        return sum;
      }

      const isNearTerm = dueDay <= todayDay + 7 || dueDay <= todayDay;
      if (!isNearTerm) {
        return sum;
      }

      return roundCurrency(sum + minimumPayment);
    }, 0),
  );

  const gap = roundCurrency(currentCash - nearTermObligation);
  const safeSpendableBalance = roundCurrency(currentCash - monthlyMinimumLoad);
  const isInsufficient = gap < 0;
  const coverageRatio =
    nearTermObligation <= 0
      ? 1
      : roundCurrency(currentCash / nearTermObligation);
  const urgentDebtCount = debts.filter((item) => {
    const remainingDebt = roundCurrency(toSafeNumber(item.remaining_debt));
    const dueDay = item.due_day;

    return (
      remainingDebt > 0 &&
      dueDay !== null &&
      dueDay >= 1 &&
      dueDay <= 31 &&
      (dueDay <= todayDay + 7 || dueDay <= todayDay)
    );
  }).length;

  const warnings: string[] = [];
  if (isInsufficient) {
    warnings.push("Nakit yetersizliği riski");
  }
  if (urgentDebtCount >= 3) {
    warnings.push("Bu ay çok sayıda yaklaşan ödeme");
  }

  let statusLabel = "Dengeli";
  let summaryText =
    "Nakit görünümü mevcut minimum ödeme yükü ile uyumlu görünüyor.";

  if (currentCash <= 0 && monthlyMinimumLoad > 0) {
    statusLabel = "Risk altındasın";
    summaryText =
      "Mevcut nakit görünmüyor. Minimum ödeme yükü için kısa vadede kaynak planı gerekiyor.";
  } else if (isInsufficient) {
    statusLabel = "Risk altındasın";
    summaryText = `Yakın dönem ödemeleri karşılamak için ${roundCurrency(
      Math.abs(gap),
    )} ek nakit gerekiyor.`;
  } else if (safeSpendableBalance < 0) {
    statusLabel = "Dikkatli ol";
    summaryText =
      "Yakın dönem ödemeleri karşılayabiliyorsunuz ancak aylık minimum ödeme yükü mevcut nakdi zorluyor.";
  } else if (urgentDebtCount >= 3) {
    statusLabel = "Dikkatli ol";
    summaryText =
      "Birden fazla yaklaşan ödeme var. Nakit yeterli olsa da önceliklendirme önemli.";
  } else {
    statusLabel = "Durum iyi";
    summaryText =
      "Minimum ödeme yükü ve yakın dönem takvim mevcut nakit görünümüyle dengeli ilerliyor.";
  }

  return {
    currentCash: roundCurrency(currentCash),
    nearTermObligation,
    monthlyMinimumLoad,
    safeSpendableBalance,
    coverageRatio,
    isInsufficient,
    gap,
    statusLabel,
    summaryText,
    warnings,
  };
}

export function buildMonthlyPerformanceSummary({
  debts,
  thisMonthPaymentTotal,
  last30DaysPaymentTotal,
}: {
  debts: DebtRow[];
  thisMonthPaymentTotal: number;
  last30DaysPaymentTotal: number;
}): MonthlyPerformanceSummary {
  const activeDebtCount = debts.filter((item) => toSafeNumber(item.remaining_debt) > 0).length;
  const closedDebtCount = debts.filter((item) => toSafeNumber(item.remaining_debt) <= 0).length;
  const totalMinimumPaymentLoad = roundCurrency(
    debts.reduce((sum, item) => {
      if (toSafeNumber(item.remaining_debt) <= 0) {
        return sum;
      }

      return roundCurrency(sum + toSafeNumber(item.minimum_payment));
    }, 0),
  );

  return {
    thisMonthPaymentTotal: roundCurrency(thisMonthPaymentTotal),
    last30DaysPaymentTotal: roundCurrency(last30DaysPaymentTotal),
    closedDebtCount,
    activeDebtCount,
    totalMinimumPaymentLoad,
  };
}
