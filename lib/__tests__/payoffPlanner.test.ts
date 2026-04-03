import {
  buildPayoffScenario,
  getDebtStrategyRanking,
  parsePayoffExtraBudget,
} from "@/lib/payoffPlanner";
import type { DebtRow } from "@/types/finance";

const debts: DebtRow[] = [
  {
    id: 1,
    created_at: "2026-03-01T10:00:00Z",
    name: "Faizli Borç",
    institution: "Banka A",
    product_type: "Kredi Kartı",
    remaining_debt: 1000,
    minimum_payment: 100,
    rate: 5,
    due_day: 20,
  },
  {
    id: 2,
    created_at: "2026-03-01T10:00:00Z",
    name: "Kucuk Borç",
    institution: "Banka B",
    product_type: "Kredi",
    remaining_debt: 200,
    minimum_payment: 50,
    rate: 2,
    due_day: 15,
  },
  {
    id: 3,
    created_at: "2026-03-01T10:00:00Z",
    name: "Vadesi Yakin",
    institution: "Banka C",
    product_type: "Kredi Kartı",
    remaining_debt: 500,
    minimum_payment: 60,
    rate: 1,
    due_day: 11,
  },
  {
    id: 4,
    created_at: "2026-03-01T10:00:00Z",
    name: "Kapanmis",
    institution: "Banka D",
    product_type: "Kredi",
    remaining_debt: 0,
    minimum_payment: 0,
    rate: 0,
    due_day: 8,
  },
];

describe("payoffPlanner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ek butce parse kurallarini uygular", () => {
    expect(parsePayoffExtraBudget("")).toEqual({ value: 0, error: null });
    expect(parsePayoffExtraBudget("-1").error).toBe(
      "Ek ödeme bütçesi negatif olamaz.",
    );
    expect(parsePayoffExtraBudget("abc").error).toBe(
      "Ek ödeme bütçesi için geçerli bir sayı girin.",
    );
  });

  it("stratejiye gore borclari siralar", () => {
    expect(
      getDebtStrategyRanking(debts, "highest_interest").map((item) => item.debt.id),
    ).toEqual([1, 2, 3]);
    expect(
      getDebtStrategyRanking(debts, "smallest_balance").map((item) => item.debt.id),
    ).toEqual([2, 3, 1]);
    expect(
      getDebtStrategyRanking(debts, "nearest_due").map((item) => item.debt.id),
    ).toEqual([3, 2, 1]);
  });

  it("scenario ozetini ve onerilen ek odemeleri uretir", () => {
    const scenario = buildPayoffScenario({
      debts,
      currentCash: 500,
      strategy: "highest_interest",
      extraBudget: 150,
    });

    expect(scenario.strategyTag).toBe("faiz baskısı yüksek");
    expect(scenario.minimumPaymentLoad).toBe(210);
    expect(scenario.totalRequiredCash).toBe(360);
    expect(scenario.canCoverPlan).toBe(true);
    expect(scenario.recommendations[0]?.debtName).toBe("Faizli Borç");
    expect(scenario.recommendations[0]?.suggestedExtraPayment).toBe(150);
  });
});
