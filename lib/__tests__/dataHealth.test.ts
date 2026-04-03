import {
  buildDataHealthSummary,
  buildOperationsOverviewSummary,
  buildRecommendedActions,
} from "@/lib/dataHealth";
import type { CashItem, DebtRow, Payment } from "@/types/finance";

const debts: DebtRow[] = [
  {
    id: 1,
    created_at: "2026-03-01T10:00:00Z",
    name: "Sorunlu Borç",
    institution: "Banka A",
    product_type: "Kredi Kartı",
    remaining_debt: -25,
    minimum_payment: 100,
    rate: 3.5,
    due_day: 40,
  },
  {
    id: 2,
    created_at: "2026-03-01T10:00:00Z",
    name: "Aktif Borç",
    institution: "Banka B",
    product_type: "Kredi",
    remaining_debt: 400,
    minimum_payment: 80,
    rate: 2,
    due_day: 11,
  },
];

const cashList: CashItem[] = [
  {
    id: 1,
    created_at: "2026-03-01T10:00:00Z",
    name: "Ana Kasa",
    balance: -10,
    note: null,
  },
];

const payments: Payment[] = [
  {
    id: 1,
    created_at: "2026-03-10T12:00:00Z",
    debt_id: 999,
    cash_id: 1,
    amount: 100,
    note: null,
  },
];

describe("dataHealth", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("veri saglik ozetini uretir", () => {
    const summary = buildDataHealthSummary({ debts, cashList, payments });

    expect(summary).toEqual({
      negativeRemainingDebtCount: 1,
      negativeCashBalanceCount: 1,
      missingPaymentRelationCount: 1,
      invalidDueDayCount: 1,
      hasIssues: true,
    });
  });

  it("operasyon ozeti ve onerilen aksiyonlari hesaplar", () => {
    const operations = buildOperationsOverviewSummary({
      debts,
      cashList,
      payments,
      upcomingPaymentCount: 2,
      cashRisk: {
        currentCash: 50,
        nearTermObligation: 180,
        isInsufficient: true,
        gap: -130,
        warnings: ["Nakit yetersizliği riski"],
      },
    });

    expect(operations.totalDebtCount).toBe(2);
    expect(operations.activeDebtCount).toBe(1);
    expect(operations.closedDebtCount).toBe(1);
    expect(operations.totalPaymentCount).toBe(1);
    expect(operations.todayPaymentCount).toBe(1);
    expect(operations.last7DaysPaymentCount).toBe(1);
    expect(operations.thisMonthPaymentAmount).toBe(100);
    expect(operations.hasRisk).toBe(true);

    const actions = buildRecommendedActions({
      health: {
        negativeRemainingDebtCount: 0,
        negativeCashBalanceCount: 1,
        missingPaymentRelationCount: 0,
        invalidDueDayCount: 0,
        hasIssues: true,
      },
      cashRisk: {
        currentCash: 50,
        nearTermObligation: 180,
        isInsufficient: true,
        gap: -130,
        warnings: ["Nakit yetersizliği riski"],
      },
      upcomingUrgentCount: 3,
      closedDebtCount: 1,
    });

    expect(actions).toContain("1 kasada negatif bakiye tespit edildi.");
    expect(actions).toContain("Yakın dönem minimum ödeme yükü mevcut nakdi aşıyor.");
    expect(actions).toContain("3 yaklaşan ödeme için plan oluşturun.");
    expect(actions).toContain("1 kapanmış borç arşivde bekliyor.");
  });
});
