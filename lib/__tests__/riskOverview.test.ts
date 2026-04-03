import {
  buildCashRiskSummary,
  buildDebtPriorityItems,
  buildMonthlyPerformanceSummary,
} from "@/lib/riskOverview";
import type { DebtRow } from "@/types/finance";

const debts: DebtRow[] = [
  {
    id: 1,
    created_at: "2026-03-01T10:00:00Z",
    name: "Kart A",
    institution: "Banka A",
    product_type: "Kredi Kartı",
    remaining_debt: 1000,
    minimum_payment: 300,
    rate: 4.5,
    due_day: 10,
  },
  {
    id: 2,
    created_at: "2026-03-01T10:00:00Z",
    name: "Kart B",
    institution: "Banka B",
    product_type: "Kredi Kartı",
    remaining_debt: 5000,
    minimum_payment: 100,
    rate: 1,
    due_day: 12,
  },
  {
    id: 3,
    created_at: "2026-03-01T10:00:00Z",
    name: "Kredi C",
    institution: "Banka C",
    product_type: "Kredi",
    remaining_debt: 600,
    minimum_payment: 80,
    rate: 0,
    due_day: 25,
  },
];

describe("riskOverview", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("borclari risk skoruna gore onceliklendirir", () => {
    const items = buildDebtPriorityItems(debts);

    expect(items[0]?.debtName).toBe("Kart A");
    expect(items[0]?.reasons).toContain("bugün kritik");
    expect(items[0]?.reasons).toContain("faiz yüksek");
    expect(items.some((item) => item.reasons.includes("büyük kalan borç"))).toBe(
      true,
    );
  });

  it("nakit riskini ve uyarilari hesaplar", () => {
    const summary = buildCashRiskSummary(debts, 200);

    expect(summary.nearTermObligation).toBe(400);
    expect(summary.gap).toBe(-200);
    expect(summary.isInsufficient).toBe(true);
    expect(summary.warnings).toContain("Nakit yetersizliği riski");
  });

  it("aylik performans metriklerini hesaplar", () => {
    const summary = buildMonthlyPerformanceSummary({
      debts,
      thisMonthPaymentTotal: 1250.456,
      last30DaysPaymentTotal: 2400.991,
    });

    expect(summary).toEqual({
      thisMonthPaymentTotal: 1250.46,
      last30DaysPaymentTotal: 2400.99,
      closedDebtCount: 0,
      activeDebtCount: 3,
      totalMinimumPaymentLoad: 480,
    });
  });
});
