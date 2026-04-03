import {
  buildPaymentDeletePlans,
  buildPaymentUpdatePlans,
  validatePaymentSelection,
} from "@/lib/paymentRules";
import type { CashItem, DebtRow, Payment } from "@/types/finance";

const debtA: DebtRow = {
  id: 1,
  created_at: "2026-03-01T10:00:00Z",
  name: "Kart A",
  institution: "Banka A",
  product_type: "Kredi Kartı",
  remaining_debt: 400,
  minimum_payment: 100,
  rate: 4.2,
  due_day: 12,
};

const debtB: DebtRow = {
  id: 2,
  created_at: "2026-03-01T10:00:00Z",
  name: "Kart B",
  institution: "Banka B",
  product_type: "Kredi Kartı",
  remaining_debt: 300,
  minimum_payment: 75,
  rate: 2.4,
  due_day: 20,
};

const cashA: CashItem = {
  id: 1,
  created_at: "2026-03-01T10:00:00Z",
  name: "Ana Kasa",
  balance: 300,
  note: null,
};

const cashB: CashItem = {
  id: 2,
  created_at: "2026-03-01T10:00:00Z",
  name: "Yedek Kasa",
  balance: 200,
  note: null,
};

describe("paymentRules", () => {
  it("odeme secimi validation kurallarini uygular", () => {
    const missingCash = validatePaymentSelection({
      form: { debtId: "1", cashId: "", amount: "100", note: "" },
      debtMap: new Map([[debtA.id, debtA]]),
      cashMap: new Map([[cashA.id, cashA]]),
    });

    expect(missingCash.error).toBe("Ödeme için kasa seçin.");

    const valid = validatePaymentSelection({
      form: { debtId: "1", cashId: "1", amount: "150.235", note: "  aciklama " },
      debtMap: new Map([[debtA.id, debtA]]),
      cashMap: new Map([[cashA.id, cashA]]),
    });

    expect(valid.error).toBeNull();
    expect(valid.data).toEqual({
      debtId: 1,
      cashId: 1,
      amount: 150.24,
      note: "aciklama",
    });
  });

  it("payment edit senaryosunda rollback ve yeni uygulamayi ayni planda hesaplar", () => {
    const existingPayment: Payment = {
      id: 99,
      created_at: "2026-03-10T12:00:00Z",
      debt_id: 1,
      cash_id: 1,
      amount: 100,
      note: null,
    };

    const result = buildPaymentUpdatePlans({
      selection: {
        debtId: 2,
        cashId: 2,
        amount: 150,
        note: null,
      },
      existingPayment,
      debtMap: new Map([
        [debtA.id, debtA],
        [debtB.id, debtB],
      ]),
      cashMap: new Map([
        [cashA.id, cashA],
        [cashB.id, cashB],
      ]),
    });

    expect(result.error).toBeNull();
    expect(result.data?.debtPlans).toEqual([
      {
        debt: debtA,
        originalRemainingDebt: 400,
        nextRemainingDebt: 500,
      },
      {
        debt: debtB,
        originalRemainingDebt: 300,
        nextRemainingDebt: 150,
      },
    ]);
    expect(result.data?.cashPlans).toEqual([
      {
        cash: cashA,
        originalBalance: 300,
        nextBalance: 400,
      },
      {
        cash: cashB,
        originalBalance: 200,
        nextBalance: 50,
      },
    ]);
  });

  it("negatif debt veya cash sonucunu engeller", () => {
    const debtOverflow = buildPaymentUpdatePlans({
      selection: {
        debtId: 2,
        cashId: 1,
        amount: 350,
        note: null,
      },
      debtMap: new Map([
        [debtA.id, debtA],
        [debtB.id, debtB],
      ]),
      cashMap: new Map([[cashA.id, cashA]]),
    });

    expect(debtOverflow.error).toBe("Ödeme tutarı kalan borçtan büyük olamaz.");

    const cashOverflow = buildPaymentUpdatePlans({
      selection: {
        debtId: 2,
        cashId: 2,
        amount: 250,
        note: null,
      },
      debtMap: new Map([[debtB.id, debtB]]),
      cashMap: new Map([[cashB.id, cashB]]),
    });

    expect(cashOverflow.error).toBe(
      "Seçilen kasanın bakiyesi ödeme için yeterli değil.",
    );
  });

  it("payment silmede debt ve cash rollback planini uretir", () => {
    const payment: Payment = {
      id: 44,
      created_at: "2026-03-10T12:00:00Z",
      debt_id: 1,
      cash_id: 1,
      amount: 100,
      note: null,
    };

    const result = buildPaymentDeletePlans({
      payment,
      debtMap: new Map([[debtA.id, debtA]]),
      cashMap: new Map([[cashA.id, cashA]]),
    });

    expect(result.error).toBeNull();
    expect(result.data?.debtPlans[0]?.nextRemainingDebt).toBe(500);
    expect(result.data?.cashPlans[0]?.nextBalance).toBe(400);
  });
});
