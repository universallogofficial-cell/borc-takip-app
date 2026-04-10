import { useEffect, useMemo, useRef, useState } from "react";
import { updateCashItem } from "@/lib/cashService";
import { updateDebtItem } from "@/lib/debtService";
import { getErrorMessage } from "@/lib/errorMessage";
import { roundCurrency, toSafeNumber } from "@/lib/financeMath";
import {
  buildPaymentDeletePlans,
  buildPaymentUpdatePlans,
  type PaymentCashUpdatePlan,
  type PaymentDebtUpdatePlan,
  validatePaymentSelection,
} from "@/lib/paymentRules";
import {
  createPaymentItem,
  deletePaymentItem,
  fetchPaymentItems,
  updatePaymentItem,
} from "@/lib/paymentService";
import { parseNumber } from "@/lib/validation";
import type {
  CashItem,
  CashMutationInput,
  DebtMutationInput,
  DebtRow,
  FlashMessageType,
  Payment,
  PaymentFilter,
  PaymentFormData,
  PaymentListRow,
  RecentActivityItem,
  ServiceScopeOptions,
} from "@/types/finance";

type UsePaymentManagerOptions = {
  debts: DebtRow[];
  cashList: CashItem[];
  onMessage: (message: string, type?: FlashMessageType) => void;
  confirmDestructiveActions?: boolean;
  userId?: string | null;
  onActivity?: (
    item: Omit<RecentActivityItem, "id" | "source" | "createdAt"> & {
      createdAt?: string;
    },
  ) => void;
  refreshCash: () => Promise<void>;
  refreshDebts: () => Promise<void>;
};

const initialForm: PaymentFormData = {
  debtId: "",
  cashId: "",
  amount: "",
  note: "",
};

const VISIBLE_PAYMENT_STEP = 20;

export function usePaymentManager({
  debts,
  cashList,
  onMessage,
  confirmDestructiveActions = true,
  userId,
  onActivity,
  refreshCash,
  refreshDebts,
}: UsePaymentManagerOptions) {
  const scopeOptions: ServiceScopeOptions = { userId };
  const previousUserIdRef = useRef<string | null | undefined>(userId);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState<boolean>(true);
  const [addingPayment, setAddingPayment] = useState<boolean>(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(
    null,
  );
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);
  const [selectedPaymentFilter, setSelectedPaymentFilter] =
    useState<PaymentFilter>("all");
  const [paymentSearch, setPaymentSearch] = useState<string>("");
  const [paymentMinAmount, setPaymentMinAmount] = useState<string>("");
  const [paymentMaxAmount, setPaymentMaxAmount] = useState<string>("");
  const [visiblePaymentCount, setVisiblePaymentCount] = useState<number>(
    VISIBLE_PAYMENT_STEP,
  );
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>(initialForm);

  const fetchPayments = async () => {
    if (!userId) {
      setPayments([]);
      setLoadingPayments(false);
      return;
    }

    setLoadingPayments(true);

    try {
      const safeData = await fetchPaymentItems(scopeOptions);
      setPayments(safeData);
    } catch (error) {
      console.error("Payment verisi alınamadı:", error);
      setPayments([]);
      onMessage(
        `Ödeme verisi alınamadı: ${getErrorMessage(error, "Bilinmeyen hata")}`,
        "error",
      );
    } finally {
      setLoadingPayments(false);
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm(initialForm);
    setEditingPaymentId(null);
  };

  useEffect(() => {
    if (previousUserIdRef.current !== userId) {
      setPayments([]);
      setPaymentForm(initialForm);
      setEditingPaymentId(null);
      setSelectedPaymentFilter("all");
      setPaymentSearch("");
      setPaymentMinAmount("");
      setPaymentMaxAmount("");
      setVisiblePaymentCount(VISIBLE_PAYMENT_STEP);
    }

    if (!userId) {
      setPayments([]);
      setLoadingPayments(false);
      setPaymentForm(initialForm);
      setEditingPaymentId(null);
    }

    previousUserIdRef.current = userId;
  }, [userId]);

  const buildDebtPayload = (
    debt: DebtRow,
    remainingDebt: number,
  ): DebtMutationInput => ({
    name: debt.name,
    institution: debt.institution,
    product_type: debt.product_type,
    remaining_debt: remainingDebt,
    minimum_payment: debt.minimum_payment,
    rate: debt.rate,
    due_day: debt.due_day,
  });

  const buildCashPayload = (
    cash: CashItem,
    balance: number,
  ): CashMutationInput => ({
    name: cash.name,
    balance,
    note: cash.note,
  });

  const refreshPaymentDependencies = async () => {
    await Promise.all([refreshCash(), refreshDebts(), fetchPayments()]);
  };

  const debtMap = useMemo(() => {
    return new Map(debts.map((item) => [item.id, item]));
  }, [debts]);

  const cashMap = useMemo(() => {
    return new Map(cashList.map((item) => [item.id, item]));
  }, [cashList]);

  const paymentRows: PaymentListRow[] = useMemo(() => {
    return payments.map((payment) => {
      const debt = debtMap.get(payment.debt_id);
      const cash = cashMap.get(payment.cash_id);

      return {
        id: payment.id,
        createdAt: payment.created_at,
        debtName: debt?.name || `Borç #${payment.debt_id}`,
        cashName: cash?.name || `Kasa #${payment.cash_id}`,
        amount: roundCurrency(toSafeNumber(payment.amount)),
        note: payment.note,
      };
    });
  }, [payments, debtMap, cashMap]);

  const filteredPaymentRows: PaymentListRow[] = useMemo(() => {
    const now = new Date();
    const normalizedSearch = paymentSearch.trim().toLocaleLowerCase("tr-TR");
    const parsedMinAmount = parseNumber(paymentMinAmount);
    const parsedMaxAmount = parseNumber(paymentMaxAmount);
    const minAmount =
      parsedMinAmount === null ? null : roundCurrency(parsedMinAmount);
    const maxAmount =
      parsedMaxAmount === null ? null : roundCurrency(parsedMaxAmount);

    return paymentRows.filter((payment) => {
      const paymentDate = new Date(payment.createdAt);
      const note = (payment.note || "").toLocaleLowerCase("tr-TR");
      const debtName = payment.debtName.toLocaleLowerCase("tr-TR");
      const cashName = payment.cashName.toLocaleLowerCase("tr-TR");
      const matchesSearch =
        !normalizedSearch ||
        debtName.includes(normalizedSearch) ||
        cashName.includes(normalizedSearch) ||
        note.includes(normalizedSearch);

      if (!matchesSearch) {
        return false;
      }

      if (minAmount !== null && payment.amount < minAmount) {
        return false;
      }

      if (maxAmount !== null && payment.amount > maxAmount) {
        return false;
      }

      if (Number.isNaN(paymentDate.getTime())) {
        return selectedPaymentFilter === "all";
      }

      if (selectedPaymentFilter === "today") {
        return (
          paymentDate.getFullYear() === now.getFullYear() &&
          paymentDate.getMonth() === now.getMonth() &&
          paymentDate.getDate() === now.getDate()
        );
      }

      if (selectedPaymentFilter === "last_7_days") {
        const last7Days = new Date(now);
        last7Days.setDate(now.getDate() - 7);
        return paymentDate >= last7Days;
      }

      if (selectedPaymentFilter === "this_month") {
        return (
          paymentDate.getFullYear() === now.getFullYear() &&
          paymentDate.getMonth() === now.getMonth()
        );
      }

      return true;
    });
  }, [
    paymentMaxAmount,
    paymentMinAmount,
    paymentRows,
    paymentSearch,
    selectedPaymentFilter,
  ]);

  const visiblePaymentRows = useMemo(() => {
    return filteredPaymentRows.slice(0, visiblePaymentCount);
  }, [filteredPaymentRows, visiblePaymentCount]);

  const totalPaymentAmount = useMemo(() => {
    return payments.reduce(
      (sum, payment) => roundCurrency(sum + toSafeNumber(payment.amount)),
      0,
    );
  }, [payments]);

  const thisMonthPaymentAmount = useMemo(() => {
    const now = new Date();

    return payments.reduce((sum, payment) => {
      const paymentDate = new Date(payment.created_at);
      const isThisMonth =
        !Number.isNaN(paymentDate.getTime()) &&
        paymentDate.getFullYear() === now.getFullYear() &&
        paymentDate.getMonth() === now.getMonth();

      if (!isThisMonth) {
        return sum;
      }

      return roundCurrency(sum + toSafeNumber(payment.amount));
    }, 0);
  }, [payments]);

  const filteredPaymentAmount = useMemo(() => {
    return filteredPaymentRows.reduce(
      (sum, payment) => roundCurrency(sum + payment.amount),
      0,
    );
  }, [filteredPaymentRows]);

  const last30DaysPaymentAmount = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 30);

    return payments.reduce((sum, payment) => {
      const paymentDate = new Date(payment.created_at);
      if (Number.isNaN(paymentDate.getTime()) || paymentDate < startDate) {
        return sum;
      }

      return roundCurrency(sum + toSafeNumber(payment.amount));
    }, 0);
  }, [payments]);

  const hasMorePayments = filteredPaymentRows.length > visiblePaymentCount;

  const applyUpdatePlans = async (
    debtPlans: PaymentDebtUpdatePlan[],
    cashPlans: PaymentCashUpdatePlan[],
  ) => {
    const appliedDebtIds: number[] = [];
    const appliedCashIds: number[] = [];

    for (const plan of debtPlans) {
        await updateDebtItem(
          plan.debt.id,
          buildDebtPayload(plan.debt, plan.nextRemainingDebt),
          scopeOptions,
        );
      appliedDebtIds.push(plan.debt.id);
    }

    for (const plan of cashPlans) {
        await updateCashItem(
          plan.cash.id,
          buildCashPayload(plan.cash, plan.nextBalance),
          scopeOptions,
        );
      appliedCashIds.push(plan.cash.id);
    }

    return { appliedDebtIds, appliedCashIds };
  };

  const rollbackUpdatePlans = async (
    debtPlans: PaymentDebtUpdatePlan[],
    cashPlans: PaymentCashUpdatePlan[],
    appliedDebtIds: number[],
    appliedCashIds: number[],
  ) => {
    for (const plan of cashPlans) {
      if (!appliedCashIds.includes(plan.cash.id)) {
        continue;
      }

      try {
        await updateCashItem(
          plan.cash.id,
          buildCashPayload(plan.cash, plan.originalBalance),
          scopeOptions,
        );
      } catch (rollbackError) {
        console.error("Kasa rollback hatası:", rollbackError);
      }
    }

    for (const plan of debtPlans) {
      if (!appliedDebtIds.includes(plan.debt.id)) {
        continue;
      }

      try {
        await updateDebtItem(
          plan.debt.id,
          buildDebtPayload(plan.debt, plan.originalRemainingDebt),
          scopeOptions,
        );
      } catch (rollbackError) {
        console.error("Borç rollback hatası:", rollbackError);
      }
    }
  };

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.info("[payment-manager] handleAddPayment:submit", {
      isEditingPayment: editingPaymentId !== null,
      editingPaymentId,
      userId: userId ?? null,
    });

    if (addingPayment) {
      return;
    }

    const selectionResult = validatePaymentSelection({
      form: paymentForm,
      debtMap,
      cashMap,
    });
    if (selectionResult.error || !selectionResult.data) {
      onMessage(selectionResult.error || "Ödeme kaydedilemedi.", "error");
      return;
    }
    const selection = selectionResult.data;
    console.info("[payment-manager] handleAddPayment:selection", selection);

    const existingPayment =
      editingPaymentId === null
        ? undefined
        : payments.find((item) => item.id === editingPaymentId);

    if (editingPaymentId !== null && !existingPayment) {
      onMessage("Düzenlenecek ödeme kaydı bulunamadı.", "error");
      return;
    }

    const updatePlanResult = buildPaymentUpdatePlans({
      selection,
      existingPayment,
      debtMap,
      cashMap,
    });
    if (updatePlanResult.error || !updatePlanResult.data) {
      onMessage(updatePlanResult.error || "Ödeme kaydedilemedi.", "error");
      return;
    }
    const updatePlans = updatePlanResult.data;
    console.info("[payment-manager] handleAddPayment:updatePlans", {
      debtPlans: updatePlans.debtPlans.map((plan) => ({
        debtId: plan.debt.id,
        originalRemainingDebt: plan.originalRemainingDebt,
        nextRemainingDebt: plan.nextRemainingDebt,
      })),
      cashPlans: updatePlans.cashPlans.map((plan) => ({
        cashId: plan.cash.id,
        originalBalance: plan.originalBalance,
        nextBalance: plan.nextBalance,
      })),
    });

    setAddingPayment(true);

    try {
      if (existingPayment) {
        const { appliedDebtIds, appliedCashIds } = await applyUpdatePlans(
          updatePlans.debtPlans,
          updatePlans.cashPlans,
        );

        try {
          await updatePaymentItem(existingPayment.id, {
            debt_id: selection.debtId,
            cash_id: selection.cashId,
            amount: selection.amount,
            note: selection.note,
          }, scopeOptions);
        } catch (error) {
          await rollbackUpdatePlans(
            updatePlans.debtPlans,
            updatePlans.cashPlans,
            appliedDebtIds,
            appliedCashIds,
          );
          throw error;
        }

        resetPaymentForm();
        await refreshPaymentDependencies();
        onActivity?.({
          entityType: "payment",
          entityId: existingPayment.id,
          action: "payment_updated",
          actionLabel: "Ödeme güncellendi",
          title: debtMap.get(selection.debtId)?.name || "Ödeme",
          description:
            cashMap.get(selection.cashId)?.name
              ? `${cashMap.get(selection.cashId)?.name} kasası üzerinden güncellendi.`
              : "Ödeme kaydı güncellendi.",
          amount: selection.amount,
        });
        onMessage("Ödeme güncellendi.", "success");
        return;
      }

      let createdPaymentId: number | null = null;
      let appliedDebtIds: number[] = [];
      let appliedCashIds: number[] = [];

      try {
        const paymentPayload = {
          debt_id: selection.debtId,
          cash_id: selection.cashId,
          amount: selection.amount,
          note: selection.note,
        };
        console.info("[payment-manager] handleAddPayment:payload", {
          payload: paymentPayload,
          scopeOptions,
        });

        const createdPayment = await createPaymentItem(paymentPayload, scopeOptions);

        createdPaymentId = createdPayment.id;

        const appliedUpdates = await applyUpdatePlans(
          updatePlans.debtPlans,
          updatePlans.cashPlans,
        );
        appliedDebtIds = appliedUpdates.appliedDebtIds;
        appliedCashIds = appliedUpdates.appliedCashIds;
      } catch (error) {
        await rollbackUpdatePlans(
          updatePlans.debtPlans,
          updatePlans.cashPlans,
          appliedDebtIds,
          appliedCashIds,
        );

        if (createdPaymentId !== null) {
          try {
            await deletePaymentItem(createdPaymentId, scopeOptions);
          } catch (rollbackError) {
            console.error("Payment rollback hatası:", rollbackError);
          }
        }

        throw error;
      }

      resetPaymentForm();
      await refreshPaymentDependencies();
      if (createdPaymentId !== null) {
        onActivity?.({
          entityType: "payment",
          entityId: createdPaymentId,
          action: "payment_made",
          actionLabel: "Ödeme yapıldı",
          title: debtMap.get(selection.debtId)?.name || "Ödeme",
          description:
            cashMap.get(selection.cashId)?.name
              ? `${cashMap.get(selection.cashId)?.name} kasasından ödendi.`
              : "Yeni ödeme kaydı oluşturuldu.",
          amount: selection.amount,
        });
      }
      onMessage("Ödeme kaydedildi.", "success");
    } catch (error) {
      console.error("Payment kayıt hatası:", error);
      await refreshPaymentDependencies();
      onMessage(
        existingPayment
          ? `Ödeme güncellenemedi: ${getErrorMessage(error, "Bilinmeyen hata")}`
          : `Ödeme kaydedilemedi: ${getErrorMessage(error, "Bilinmeyen hata")}`,
        "error",
      );
    } finally {
      setAddingPayment(false);
    }
  };

  const handleEditPayment = (paymentId: number) => {
    const payment = payments.find((item) => item.id === paymentId);

    if (!payment) {
      onMessage("Düzenlenecek ödeme kaydı bulunamadı.", "error");
      return;
    }

    setPaymentForm({
      debtId: String(payment.debt_id),
      cashId: String(payment.cash_id),
      amount: String(payment.amount),
      note: payment.note || "",
    });
    setEditingPaymentId(payment.id);
  };

  const handleCancelPaymentEdit = () => {
    resetPaymentForm();
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (deletingPaymentId !== null) {
      return;
    }

    const payment = payments.find((item) => item.id === paymentId);

    if (!payment) {
      onMessage("Silinecek ödeme kaydı bulunamadı.", "error");
      return;
    }

    if (confirmDestructiveActions) {
      const shouldDelete = window.confirm(
        "Bu ödeme kaydını silmek istiyor musunuz?",
      );

      if (!shouldDelete) {
        return;
      }
    }

    const deletePlanResult = buildPaymentDeletePlans({
      payment,
      debtMap,
      cashMap,
    });
    if (deletePlanResult.error || !deletePlanResult.data) {
      onMessage(deletePlanResult.error || "Ödeme silinemedi.", "error");
      return;
    }
    const { debtPlans, cashPlans } = deletePlanResult.data;
    const paymentAmount = roundCurrency(toSafeNumber(payment.amount));

    setDeletingPaymentId(paymentId);

    try {
      const { appliedDebtIds, appliedCashIds } = await applyUpdatePlans(
        debtPlans,
        cashPlans,
      );

      try {
        await deletePaymentItem(payment.id, scopeOptions);
      } catch (error) {
        await rollbackUpdatePlans(
          debtPlans,
          cashPlans,
          appliedDebtIds,
          appliedCashIds,
        );
        throw error;
      }

      if (editingPaymentId === payment.id) {
        resetPaymentForm();
      }
      await refreshPaymentDependencies();
      onActivity?.({
        entityType: "payment",
        entityId: payment.id,
        action: "payment_deleted",
        actionLabel: "Ödeme silindi",
        title: debtMap.get(payment.debt_id)?.name || "Ödeme",
        description:
          cashMap.get(payment.cash_id)?.name
            ? `${cashMap.get(payment.cash_id)?.name} kasasındaki kayıt geri alındı.`
            : "Ödeme kaydı kaldırıldı.",
        amount: paymentAmount,
      });
      onMessage("Ödeme silindi.", "success");
    } catch (error) {
      console.error("Payment silme hatası:", error);
      await refreshPaymentDependencies();
      onMessage(
        `Ödeme silinemedi: ${getErrorMessage(error, "Bilinmeyen hata")}`,
        "error",
      );
    } finally {
      setDeletingPaymentId(null);
    }
  };

  const handleChangePaymentFilter = (filter: PaymentFilter) => {
    setSelectedPaymentFilter(filter);
    setVisiblePaymentCount(VISIBLE_PAYMENT_STEP);
  };

  const handleChangePaymentSearch = (value: string) => {
    setPaymentSearch(value);
    setVisiblePaymentCount(VISIBLE_PAYMENT_STEP);
  };

  const handleChangePaymentMinAmount = (value: string) => {
    setPaymentMinAmount(value);
    setVisiblePaymentCount(VISIBLE_PAYMENT_STEP);
  };

  const handleChangePaymentMaxAmount = (value: string) => {
    setPaymentMaxAmount(value);
    setVisiblePaymentCount(VISIBLE_PAYMENT_STEP);
  };

  const handleLoadMorePayments = () => {
    setVisiblePaymentCount((prev) => prev + VISIBLE_PAYMENT_STEP);
  };

  return {
    payments,
    paymentRows,
    filteredPaymentRows,
    visiblePaymentRows,
    paymentForm,
    setPaymentForm,
    loadingPayments,
    addingPayment,
    deletingPaymentId,
    editingPaymentId,
    selectedPaymentFilter,
    paymentSearch,
    paymentMinAmount,
    paymentMaxAmount,
    totalPaymentAmount,
    thisMonthPaymentAmount,
    filteredPaymentAmount,
    last30DaysPaymentAmount,
    hasMorePayments,
    fetchPayments,
    handleAddPayment,
    handleEditPayment,
    handleDeletePayment,
    handleCancelPaymentEdit,
    handleChangePaymentFilter,
    handleChangePaymentSearch,
    handleChangePaymentMinAmount,
    handleChangePaymentMaxAmount,
    handleLoadMorePayments,
    resetPaymentForm,
  };
}
