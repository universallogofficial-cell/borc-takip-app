import {
  buildUpcomingPayments,
  getUpcomingPaymentStatus,
} from "@/lib/upcomingPayments";
import type { DebtRow } from "@/types/finance";

const debts: DebtRow[] = [
  {
    id: 1,
    created_at: "2026-03-01T10:00:00Z",
    name: "Kart A",
    institution: "Banka A",
    product_type: "Kredi Kartı",
    remaining_debt: 1500,
    minimum_payment: 400,
    rate: 4.5,
    due_day: 10,
  },
  {
    id: 2,
    created_at: "2026-03-01T10:00:00Z",
    name: "Kart B",
    institution: "Banka B",
    product_type: "Kredi Kartı",
    remaining_debt: 900,
    minimum_payment: 200,
    rate: 3.2,
    due_day: 14,
  },
  {
    id: 3,
    created_at: "2026-03-01T10:00:00Z",
    name: "Kredi C",
    institution: "Banka C",
    product_type: "Kredi",
    remaining_debt: 2000,
    minimum_payment: 350,
    rate: 2.1,
    due_day: 25,
  },
  {
    id: 4,
    created_at: "2026-03-01T10:00:00Z",
    name: "Kart D",
    institution: "Banka D",
    product_type: "Kredi Kartı",
    remaining_debt: 600,
    minimum_payment: 150,
    rate: 1.9,
    due_day: 5,
  },
  {
    id: 5,
    created_at: "2026-03-01T10:00:00Z",
    name: "Kapanmış",
    institution: "Banka E",
    product_type: "Kredi",
    remaining_debt: 0,
    minimum_payment: 0,
    rate: 0,
    due_day: 12,
  },
];

describe("upcomingPayments", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("durum etiketini gun bazinda hesaplar", () => {
    expect(getUpcomingPaymentStatus(10, 10)).toBe("today");
    expect(getUpcomingPaymentStatus(14, 10)).toBe("approaching");
    expect(getUpcomingPaymentStatus(25, 10)).toBe("later_this_month");
    expect(getUpcomingPaymentStatus(5, 10)).toBe("passed");
  });

  it("yalnizca aktif ve gecerli vade kayitlarini listeler ve siralar", () => {
    const result = buildUpcomingPayments(debts);

    expect(result.items.map((item) => item.id)).toEqual([1, 2, 3, 4]);
    expect(result.items.map((item) => item.status)).toEqual([
      "today",
      "approaching",
      "later_this_month",
      "passed",
    ]);
    expect(result.summary).toEqual({
      dueThisMonthCount: 4,
      totalMinimumPayment: 1100,
      urgentCount: 2,
    });
  });
});
