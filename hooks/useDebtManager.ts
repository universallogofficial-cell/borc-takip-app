import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDebtItem,
  deleteDebtItem,
  fetchDebtItems,
  updateDebtItem,
} from "@/lib/debtService";
import { getDebtLifecycleStatus, isClosedDebt } from "@/lib/debtLifecycle";
import { getErrorMessage } from "@/lib/errorMessage";
import { roundCurrency, toSafeNumber } from "@/lib/financeMath";
import { formatCurrency } from "@/lib/formatCurrency";
import { countPaymentsByDebtId } from "@/lib/paymentService";
import {
  isBlank,
  parseNumber,
  parseOptionalInteger,
  parseOptionalNumber,
} from "@/lib/validation";
import type {
  ClosedDebtItem,
  DebtMutationInput,
  DebtRow,
  DebtTab,
  DebtTableItem,
  FlashMessageType,
  RecentActivityItem,
  ServiceScopeOptions,
} from "@/types/finance";

type UseDebtManagerOptions = {
  onMessage: (message: string, type?: FlashMessageType) => void;
  confirmDestructiveActions?: boolean;
  userId?: string | null;
  onActivity?: (
    item: Omit<RecentActivityItem, "id" | "source" | "createdAt"> & {
      createdAt?: string;
    },
  ) => void;
};

export function useDebtManager({
  onMessage,
  confirmDestructiveActions = true,
  userId,
  onActivity,
}: UseDebtManagerOptions) {
  const scopeOptions: ServiceScopeOptions = { userId };
  const previousUserIdRef = useRef<string | null | undefined>(userId);
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [debtSearch, setDebtSearch] = useState<string>("");
  const [loadingDebts, setLoadingDebts] = useState<boolean>(true);
  const [addingDebt, setAddingDebt] = useState<boolean>(false);
  const [debtName, setDebtName] = useState<string>("");
  const [institution, setInstitution] = useState<string>("");
  const [productType, setProductType] = useState<string>("");
  const [remainingDebt, setRemainingDebt] = useState<string>("");
  const [minimumPayment, setMinimumPayment] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [dueDay, setDueDay] = useState<string>("");
  const [editingDebtId, setEditingDebtId] = useState<number | null>(null);
  const [isEditingDebt, setIsEditingDebt] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<DebtTab>("all");

  const fetchDebts = async () => {
    if (!userId) {
      setDebts([]);
      setLoadingDebts(false);
      return;
    }

    setLoadingDebts(true);

    try {
      const safeData = await fetchDebtItems(scopeOptions);
      setDebts(safeData);
    } catch (error) {
      console.error("Debt verisi alınamadı:", error);
      setDebts([]);
      onMessage(
        `Borç verisi alınamadı: ${getErrorMessage(error, "Bilinmeyen hata")}`,
        "error",
      );
    } finally {
      setLoadingDebts(false);
    }
  };

  const resetDebtForm = () => {
    setDebtName("");
    setInstitution("");
    setProductType("");
    setRemainingDebt("");
    setMinimumPayment("");
    setRate("");
    setDueDay("");
    setIsEditingDebt(false);
    setEditingDebtId(null);
  };

  useEffect(() => {
    if (previousUserIdRef.current !== userId) {
      setDebts([]);
      setDebtName("");
      setInstitution("");
      setProductType("");
      setRemainingDebt("");
      setMinimumPayment("");
      setRate("");
      setDueDay("");
      setIsEditingDebt(false);
      setEditingDebtId(null);
      setDebtSearch("");
      setSelectedTab("all");
    }

    if (!userId) {
      setDebts([]);
      setLoadingDebts(false);
      setDebtName("");
      setInstitution("");
      setProductType("");
      setRemainingDebt("");
      setMinimumPayment("");
      setRate("");
      setDueDay("");
      setIsEditingDebt(false);
      setEditingDebtId(null);
    }

    previousUserIdRef.current = userId;
  }, [userId]);

  const handleAddDebt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.info("[debt-manager] handleAddDebt:submit", {
      isEditingDebt,
      editingDebtId,
      userId: userId ?? null,
    });

    if (addingDebt) {
      return;
    }

    if (isBlank(debtName)) {
      onMessage("Borç adı zorunludur.", "error");
      return;
    }

    if (isBlank(institution)) {
      onMessage("Kurum zorunludur.", "error");
      return;
    }

    const remainingDebtValue = parseNumber(remainingDebt);
    if (remainingDebtValue === null || remainingDebtValue < 0) {
      onMessage(
        "Toplam borç için negatif olmayan geçerli bir sayı girin.",
        "error",
      );
      return;
    }

    const minimumPaymentValue = parseOptionalNumber(minimumPayment);
    if (minimumPaymentValue !== null && minimumPaymentValue < 0) {
      onMessage("Asgari ödeme tutarı negatif olamaz.", "error");
      return;
    }
    if (!isBlank(minimumPayment) && minimumPaymentValue === null) {
      onMessage("Asgari ödeme tutarı için geçerli bir sayı girin.", "error");
      return;
    }

    const rateValue = parseOptionalNumber(rate);
    if (rateValue !== null && rateValue < 0) {
      onMessage("Faiz oranı negatif olamaz.", "error");
      return;
    }
    if (!isBlank(rate) && rateValue === null) {
      onMessage("Faiz oranı için geçerli bir sayı girin.", "error");
      return;
    }

    const dueDayValue = parseOptionalInteger(dueDay);
    if (!isBlank(dueDay) && dueDayValue === null) {
      onMessage("Son ödeme günü tam sayı olmalıdır.", "error");
      return;
    }
    if (dueDayValue !== null && (dueDayValue < 1 || dueDayValue > 31)) {
      onMessage("Son ödeme günü 1 ile 31 arasında olmalıdır.", "error");
      return;
    }

    setAddingDebt(true);

    const debtPayload: DebtMutationInput = {
      name: debtName.trim(),
      institution: institution.trim() || null,
      product_type: productType.trim() || null,
      remaining_debt: roundCurrency(remainingDebtValue),
      minimum_payment:
        minimumPaymentValue === null ? null : roundCurrency(minimumPaymentValue),
      rate: rateValue,
      due_day: dueDayValue,
    };

    console.info("[debt-manager] handleAddDebt:payload", {
      payload: debtPayload,
      scopeOptions,
    });

    try {
      if (isEditingDebt && editingDebtId !== null) {
        await updateDebtItem(editingDebtId, debtPayload, scopeOptions);

        resetDebtForm();
        await fetchDebts();
        onActivity?.({
          entityType: "debt",
          entityId: editingDebtId,
          action: "updated",
          actionLabel: "Borç güncellendi",
          title: debtPayload.name,
          description:
            debtPayload.institution || "Borç planı güncellenerek portföye işlendi.",
          amount: debtPayload.remaining_debt,
        });
        onMessage("Borç güncellendi.", "success");
        return;
      }

      const createdDebt = await addDebtItem(debtPayload, scopeOptions);

      resetDebtForm();
      await fetchDebts();
      onActivity?.({
        entityType: "debt",
        entityId: createdDebt.id,
        action: "created",
        actionLabel: "Borç eklendi",
        title: createdDebt.name,
        description:
          createdDebt.institution || "Yeni borç kaydı planlamaya eklendi.",
        amount: debtPayload.remaining_debt,
        createdAt: createdDebt.created_at,
      });
      onMessage("Borç eklendi.", "success");
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Bilinmeyen hata");

      if (isEditingDebt && editingDebtId !== null) {
        console.error("Borç güncelleme hatası:", error);
        onMessage(`Borç güncellenemedi: ${errorMessage}`, "error");
      } else {
        console.error("Borç ekleme hatası:", error);
        onMessage(`Borç eklenemedi: ${errorMessage}`, "error");
      }
    } finally {
      setAddingDebt(false);
    }
  };

  const handleDeleteDebt = async (id: number) => {
    try {
      const relatedPaymentCount = await countPaymentsByDebtId(id, scopeOptions);

      if (relatedPaymentCount > 0) {
        onMessage("Bu borca bağlı ödeme kayıtları olduğu için silinemez.", "error");
        return;
      }

      if (confirmDestructiveActions) {
        const shouldDelete = window.confirm(
          "Bu borç kaydını silmek istiyor musunuz?",
        );

        if (!shouldDelete) {
          return;
        }
      }

      await deleteDebtItem(id, scopeOptions);

      resetDebtForm();
      await fetchDebts();
      onActivity?.({
        entityType: "debt",
        entityId: id,
        action: "deleted",
        actionLabel: "Borç silindi",
        title: `Borç #${id}`,
        description: "Borç kaydı portföyden kaldırıldı.",
        amount: null,
      });
      onMessage("Borç silindi.", "success");
    } catch (error) {
      console.error("Silme hatası:", error);
      onMessage(
        `Borç silinemedi: ${getErrorMessage(error, "Bilinmeyen hata")}`,
        "error",
      );
    }
  };

  const handleEditDebt = (item: DebtTableItem) => {
    const debt = debts.find((row) => row.id === item.id);

    if (debt) {
      handleEditDebtRow(debt);
      return;
    }

    const dueDayMatch = item.dueDate.match(/\d+/);

    setDebtName(item.name);
    setInstitution(item.status);
    setProductType(item.type);
    setRemainingDebt(item.rawAmount);
    setDueDay(dueDayMatch ? dueDayMatch[0] : "");
    setIsEditingDebt(true);
    setEditingDebtId(item.id);
  };

  const handleCancelDebtEdit = () => {
    resetDebtForm();
  };

  const handleEditDebtRow = (item: DebtRow) => {
    setDebtName(item.name);
    setInstitution(item.institution || "");
    setProductType(item.product_type || "");
    setRemainingDebt(String(roundCurrency(toSafeNumber(item.remaining_debt))));
    setMinimumPayment(
      item.minimum_payment === null
        ? ""
        : String(roundCurrency(toSafeNumber(item.minimum_payment))),
    );
    setRate(item.rate === null ? "" : String(item.rate));
    setDueDay(item.due_day === null ? "" : String(item.due_day));
    setIsEditingDebt(true);
    setEditingDebtId(item.id);
  };

  const filteredDebts = useMemo(() => {
    return debts.filter((item) => {
      const normalizedSearch = debtSearch.trim().toLocaleLowerCase("tr-TR");
      const normalizedType = (item.product_type || "").toLocaleLowerCase(
        "tr-TR",
      );
      const normalizedName = item.name.toLocaleLowerCase("tr-TR");
      const normalizedInstitution = (item.institution || "").toLocaleLowerCase(
        "tr-TR",
      );

      const matchesSearch =
        !normalizedSearch ||
        normalizedName.includes(normalizedSearch) ||
        normalizedInstitution.includes(normalizedSearch);

      if (!matchesSearch) return false;

      if (selectedTab === "all") return true;

      if (selectedTab === "credit_card") {
        return (
          normalizedType.includes("kredi kart") ||
          normalizedType.includes("credit card")
        );
      }

      if (selectedTab === "loan") {
        return (
          normalizedType === "kredi" ||
          normalizedType.includes("ihtiyaç kred")
        );
      }

      if (selectedTab === "other") {
        const isCreditCard =
          normalizedType.includes("kredi kart") ||
          normalizedType.includes("credit card");

        const isLoan =
          normalizedType === "kredi" ||
          normalizedType.includes("ihtiyaç kred");

        return !isCreditCard && !isLoan;
      }

      return true;
    });
  }, [debtSearch, debts, selectedTab]);

  const activeDebts = useMemo(() => {
    return filteredDebts.filter((item) => !isClosedDebt(item.remaining_debt));
  }, [filteredDebts]);

  const closedDebts = useMemo(() => {
    return filteredDebts.filter((item) => isClosedDebt(item.remaining_debt));
  }, [filteredDebts]);

  const debtTableData: DebtTableItem[] = activeDebts.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.product_type || item.institution || "Belirsiz",
    amount: formatCurrency(toSafeNumber(item.remaining_debt)),
    rawAmount: String(roundCurrency(toSafeNumber(item.remaining_debt))),
    dueDate: item.due_day ? `${item.due_day}. gün` : "-",
    status: item.institution || "Aktif",
  }));

  const closedDebtItems: ClosedDebtItem[] = closedDebts.map((item) => ({
    id: item.id,
    name: item.name,
    institution: item.institution || "Kurum yok",
    productType: item.product_type || "-",
    remainingDebt: roundCurrency(toSafeNumber(item.remaining_debt)),
    status: getDebtLifecycleStatus(item.remaining_debt),
  }));

  return {
    debts,
    activeDebts,
    closedDebts,
    closedDebtItems,
    loadingDebts,
    debtSearch,
    setDebtSearch,
    debtName,
    setDebtName,
    institution,
    setInstitution,
    productType,
    setProductType,
    remainingDebt,
    setRemainingDebt,
    minimumPayment,
    setMinimumPayment,
    rate,
    setRate,
    dueDay,
    setDueDay,
    addingDebt,
    isEditingDebt,
    editingDebtId,
    selectedTab,
    setSelectedTab,
    filteredDebts,
    debtTableData,
    fetchDebts,
    handleAddDebt,
    handleEditDebt,
    handleEditDebtRow,
    handleDeleteDebt,
    handleCancelDebtEdit,
  };
}
