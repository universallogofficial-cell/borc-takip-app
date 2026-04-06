import { roundCurrency, toSafeNumber } from "@/lib/financeMath";
import { isBlank, parseNumber } from "@/lib/validation";
import type {
  DebtRow,
  PayoffPlannerItem,
  PayoffScenario,
  PayoffStrategy,
} from "@/types/finance";

type RankedDebt = {
  debt: DebtRow;
  remainingDebt: number;
  minimumPayment: number;
  rate: number;
  dueDay: number | null;
  dueDistance: number;
};

export const payoffStrategyOptions: Array<{
  value: PayoffStrategy;
  label: string;
}> = [
  { value: "highest_interest", label: "En Yüksek Faiz" },
  { value: "smallest_balance", label: "En Küçük Borç" },
  { value: "nearest_due", label: "En Yakın Vade" },
];

function getStrategyMeta(strategy: PayoffStrategy) {
  if (strategy === "highest_interest") {
    return {
      label: "En Yüksek Faiz Öncelikli",
      tag: "faiz baskısı yüksek",
    };
  }

  if (strategy === "smallest_balance") {
    return {
      label: "En Küçük Borç Öncelikli",
      tag: "hızlı kapanış fırsatı",
    };
  }

  return {
    label: "Vadesi En Yakın Öncelikli",
    tag: "vade baskısı yüksek",
  };
}

function getDueDistance(dueDay: number | null, todayDay: number) {
  if (dueDay === null || dueDay < 1 || dueDay > 31) {
    return Number.POSITIVE_INFINITY;
  }

  if (dueDay < todayDay) {
    return 0;
  }

  return dueDay - todayDay;
}

function compareByStrategy(a: RankedDebt, b: RankedDebt, strategy: PayoffStrategy) {
  if (strategy === "highest_interest") {
    return (
      b.rate - a.rate ||
      a.dueDistance - b.dueDistance ||
      b.remainingDebt - a.remainingDebt
    );
  }

  if (strategy === "smallest_balance") {
    return (
      a.remainingDebt - b.remainingDebt ||
      b.rate - a.rate ||
      a.dueDistance - b.dueDistance
    );
  }

  return (
    a.dueDistance - b.dueDistance ||
    b.minimumPayment - a.minimumPayment ||
    b.rate - a.rate
  );
}

function buildDrivers(
  item: RankedDebt,
  strategy: PayoffStrategy,
  todayDay: number,
) {
  const drivers: string[] = [];

  if (item.dueDay === todayDay) {
    drivers.push("bugün vade");
  } else if (item.dueDay !== null && item.dueDistance <= 3) {
    drivers.push("vade çok yakın");
  } else if (item.dueDay !== null && item.dueDistance <= 7) {
    drivers.push("yaklaşan vade");
  }

  if (item.rate >= 4) {
    drivers.push("faiz baskısı");
  }

  if (item.minimumPayment > 0) {
    drivers.push("minimum ödeme yükü");
  }

  if (strategy === "smallest_balance") {
    drivers.push("hızlı kapanış fırsatı");
  } else if (item.remainingDebt >= item.minimumPayment * 12 && item.minimumPayment > 0) {
    drivers.push("yüksek ana para");
  }

  return drivers.slice(0, 3);
}

function buildReason(item: RankedDebt, strategy: PayoffStrategy, todayDay: number) {
  if (item.dueDay === todayDay) {
    return "Bugün kritik, gecikme riski var.";
  }

  if (
    strategy === "highest_interest" &&
    item.rate > 0
  ) {
    return "Faiz yükünü önce azaltmak için öne çıktı.";
  }

  if (strategy === "smallest_balance") {
    return "Daha hızlı kapatılabilecek düşük bakiyeli borç.";
  }

  if (
    strategy === "nearest_due" &&
    item.dueDay !== null &&
    item.dueDistance <= 7
  ) {
    return "Vadesi yakın olduğu için ödeme baskısı yüksek.";
  }

  if (item.minimumPayment > 0) {
    return "Minimum ödeme yükünü hafifletmek için uygun.";
  }

  return "Mevcut nakit planında öne çıkan borç.";
}

export function parsePayoffExtraBudget(value: string) {
  if (isBlank(value)) {
    return { value: 0, error: null as string | null };
  }

  const parsed = parseNumber(value);
  if (parsed === null) {
    return {
      value: 0,
      error: "Ek ödeme bütçesi için geçerli bir sayı girin.",
    };
  }

  if (parsed < 0) {
    return {
      value: 0,
      error: "Ek ödeme bütçesi negatif olamaz.",
    };
  }

  return { value: roundCurrency(parsed), error: null as string | null };
}

export function getDebtStrategyRanking(
  debts: DebtRow[],
  strategy: PayoffStrategy,
): RankedDebt[] {
  const todayDay = new Date().getDate();

  return debts
    .filter((item) => roundCurrency(toSafeNumber(item.remaining_debt)) > 0)
    .map((item) => {
      const remainingDebt = roundCurrency(toSafeNumber(item.remaining_debt));
      const minimumPayment = roundCurrency(toSafeNumber(item.minimum_payment));
      const rate = roundCurrency(toSafeNumber(item.rate));
      const dueDay = item.due_day;

      return {
        debt: item,
        remainingDebt,
        minimumPayment,
        rate,
        dueDay,
        dueDistance: getDueDistance(dueDay, todayDay),
      };
    })
    .sort((a, b) => compareByStrategy(a, b, strategy));
}

export function buildPayoffScenario({
  debts,
  currentCash,
  strategy,
  extraBudget,
}: {
  debts: DebtRow[];
  currentCash: number;
  strategy: PayoffStrategy;
  extraBudget: number;
}): PayoffScenario {
  const todayDay = new Date().getDate();
  const rankedDebts = getDebtStrategyRanking(debts, strategy);
  const activeDebtCount = rankedDebts.length;
  const minimumPaymentLoad = roundCurrency(
    rankedDebts.reduce((sum, item) => sum + item.minimumPayment, 0),
  );
  const safeCurrentCash = roundCurrency(currentCash);
  const safeExtraBudget = roundCurrency(Math.max(extraBudget, 0));
  const totalRequiredCash = roundCurrency(minimumPaymentLoad + safeExtraBudget);
  const availableAfterMinimums = roundCurrency(safeCurrentCash - minimumPaymentLoad);
  const canCoverMinimums = availableAfterMinimums >= 0;
  const canCoverPlan = safeCurrentCash >= totalRequiredCash;
  const strategyMeta = getStrategyMeta(strategy);
  const usableExtraBudget = roundCurrency(
    Math.max(Math.min(safeExtraBudget, Math.max(availableAfterMinimums, 0)), 0),
  );

  let feasibilityLabel = "Plan uygulanabilir";
  let summaryNote = "Mevcut nakit, minimum ödemeler ve seçilen ek bütçeyi karşılıyor.";

  if (activeDebtCount === 0) {
    feasibilityLabel = "Aktif borç yok";
    summaryNote = "Planlama için açık borç kaydı bulunmuyor.";
  } else if (safeCurrentCash <= 0) {
    feasibilityLabel = "Nakit yok";
    summaryNote = "Ek ödeme planı üretmek için kullanılabilir nakit görünmüyor.";
  } else if (!canCoverMinimums) {
    feasibilityLabel = "Nakit yetersiz";
    summaryNote = "Mevcut nakit, minimum ödeme yükünü tam karşılamıyor.";
  } else if (!canCoverPlan) {
    feasibilityLabel = "Kısmi uygulanabilir";
    summaryNote =
      "Asgari ödemeler karşılanıyor, ancak girilen ek bütçenin tamamı için nakit yetmiyor.";
  }

  let remainingAllocation = usableExtraBudget;
  const recommendations: PayoffPlannerItem[] = rankedDebts.slice(0, 3).map((item) => {
    const drivers = buildDrivers(item, strategy, todayDay);
    const suggestedExtraPayment = roundCurrency(
      Math.min(item.remainingDebt, Math.max(remainingAllocation, 0)),
    );
    remainingAllocation = roundCurrency(remainingAllocation - suggestedExtraPayment);

    return {
      id: item.debt.id,
      debtName: item.debt.name,
      institution: item.debt.institution || "Kurum yok",
      remainingDebt: item.remainingDebt,
      minimumPayment: item.minimumPayment,
      rate: item.rate,
      dueDay: item.dueDay,
      suggestedExtraPayment,
      reason: buildReason(item, strategy, todayDay),
      drivers,
    };
  });

  return {
    strategy,
    strategyLabel: strategyMeta.label,
    strategyTag: strategyMeta.tag,
    activeDebtCount,
    extraBudget: safeExtraBudget,
    currentCash: safeCurrentCash,
    minimumPaymentLoad,
    totalRequiredCash,
    availableAfterMinimums,
    canCoverMinimums,
    canCoverPlan,
    feasibilityLabel,
    summaryNote,
    recommendations,
  };
}
