import { roundCurrency, toSafeNumber } from "@/lib/financeMath";
import { isBlank, parseNumber } from "@/lib/validation";
import type { CashItem, DebtRow, Payment, PaymentFormData } from "@/types/finance";

export type PaymentSelection = {
  debtId: number;
  cashId: number;
  amount: number;
  note: string | null;
};

export type PaymentDebtUpdatePlan = {
  debt: DebtRow;
  originalRemainingDebt: number;
  nextRemainingDebt: number;
};

export type PaymentCashUpdatePlan = {
  cash: CashItem;
  originalBalance: number;
  nextBalance: number;
};

export type PaymentUpdatePlans = {
  debtPlans: PaymentDebtUpdatePlan[];
  cashPlans: PaymentCashUpdatePlan[];
};

export function validatePaymentSelection({
  form,
  debtMap,
  cashMap,
}: {
  form: PaymentFormData;
  debtMap: Map<number, DebtRow>;
  cashMap: Map<number, CashItem>;
}): { data: PaymentSelection | null; error: string | null } {
  if (isBlank(form.debtId)) {
    return { data: null, error: "Ödeme için borç seçin." };
  }

  if (isBlank(form.cashId)) {
    return { data: null, error: "Ödeme için kasa seçin." };
  }

  const amountValue = parseNumber(form.amount);
  if (amountValue === null || amountValue <= 0) {
    return {
      data: null,
      error: "Ödeme tutarı 0'dan büyük geçerli bir sayı olmalıdır.",
    };
  }

  const debtId = Number(form.debtId);
  const cashId = Number(form.cashId);

  if (!debtMap.has(debtId)) {
    return { data: null, error: "Seçilen borç bulunamadı." };
  }

  if (!cashMap.has(cashId)) {
    return { data: null, error: "Seçilen kasa bulunamadı." };
  }

  return {
    data: {
      debtId,
      cashId,
      amount: roundCurrency(amountValue),
      note: form.note.trim() || null,
    },
    error: null,
  };
}

export function buildPaymentUpdatePlans({
  selection,
  existingPayment,
  debtMap,
  cashMap,
}: {
  selection: PaymentSelection;
  existingPayment?: Payment;
  debtMap: Map<number, DebtRow>;
  cashMap: Map<number, CashItem>;
}): { data: PaymentUpdatePlans | null; error: string | null } {
  const debtDeltas = new Map<number, number>();
  const cashDeltas = new Map<number, number>();

  if (existingPayment) {
    const existingAmount = roundCurrency(toSafeNumber(existingPayment.amount));
    debtDeltas.set(
      existingPayment.debt_id,
      roundCurrency((debtDeltas.get(existingPayment.debt_id) || 0) + existingAmount),
    );
    cashDeltas.set(
      existingPayment.cash_id,
      roundCurrency((cashDeltas.get(existingPayment.cash_id) || 0) + existingAmount),
    );
  }

  debtDeltas.set(
    selection.debtId,
    roundCurrency((debtDeltas.get(selection.debtId) || 0) - selection.amount),
  );
  cashDeltas.set(
    selection.cashId,
    roundCurrency((cashDeltas.get(selection.cashId) || 0) - selection.amount),
  );

  const debtPlans: PaymentDebtUpdatePlan[] = [];
  for (const [debtId, delta] of debtDeltas.entries()) {
    if (delta === 0) {
      continue;
    }

    const debt = debtMap.get(debtId);
    if (!debt) {
      return { data: null, error: "Ödeme için gerekli borç kaydı bulunamadı." };
    }

    const originalRemainingDebt = roundCurrency(toSafeNumber(debt.remaining_debt));
    debtPlans.push({
      debt,
      originalRemainingDebt,
      nextRemainingDebt: roundCurrency(originalRemainingDebt + delta),
    });
  }

  const cashPlans: PaymentCashUpdatePlan[] = [];
  for (const [cashId, delta] of cashDeltas.entries()) {
    if (delta === 0) {
      continue;
    }

    const cash = cashMap.get(cashId);
    if (!cash) {
      return { data: null, error: "Ödeme için gerekli kasa kaydı bulunamadı." };
    }

    const originalBalance = roundCurrency(toSafeNumber(cash.balance));
    cashPlans.push({
      cash,
      originalBalance,
      nextBalance: roundCurrency(originalBalance + delta),
    });
  }

  if (debtPlans.some((plan) => plan.nextRemainingDebt < 0)) {
    return {
      data: null,
      error: "Ödeme tutarı toplam borçtan büyük olamaz. Tutarı düşürüp tekrar deneyin.",
    };
  }

  if (cashPlans.some((plan) => plan.nextBalance < 0)) {
    return {
      data: null,
      error:
        "Seçilen kasada yeterli bakiye yok. Tutarı düşürün veya farklı kasa seçin.",
    };
  }

  return { data: { debtPlans, cashPlans }, error: null };
}

export function buildPaymentDeletePlans({
  payment,
  debtMap,
  cashMap,
}: {
  payment: Payment;
  debtMap: Map<number, DebtRow>;
  cashMap: Map<number, CashItem>;
}): { data: PaymentUpdatePlans | null; error: string | null } {
  const debt = debtMap.get(payment.debt_id);
  const cash = cashMap.get(payment.cash_id);

  if (!debt || !cash) {
    return {
      data: null,
      error: "Ödeme kaydı için bağlı borç veya kasa bulunamadı.",
    };
  }

  const paymentAmount = roundCurrency(toSafeNumber(payment.amount));
  if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
    return {
      data: null,
      error: "Ödeme tutarı geçersiz olduğu için kayıt silinemedi.",
    };
  }

  return {
    data: {
      debtPlans: [
        {
          debt,
          originalRemainingDebt: roundCurrency(toSafeNumber(debt.remaining_debt)),
          nextRemainingDebt: roundCurrency(
            toSafeNumber(debt.remaining_debt) + paymentAmount,
          ),
        },
      ],
      cashPlans: [
        {
          cash,
          originalBalance: roundCurrency(toSafeNumber(cash.balance)),
          nextBalance: roundCurrency(toSafeNumber(cash.balance) + paymentAmount),
        },
      ],
    },
    error: null,
  };
}
