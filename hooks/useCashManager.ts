import { useEffect, useMemo, useRef, useState } from "react";
import {
  addCashItem,
  deleteCashItem,
  fetchCashItems,
  updateCashItem,
} from "@/lib/cashService";
import { roundCurrency, toSafeNumber } from "@/lib/financeMath";
import { countPaymentsByCashId } from "@/lib/paymentService";
import { isBlank, parseNumber } from "@/lib/validation";
import type {
  CashItem,
  CashMutationInput,
  FlashMessageType,
  RecentActivityItem,
  ServiceScopeOptions,
} from "@/types/finance";

type UseCashManagerOptions = {
  onMessage: (message: string, type?: FlashMessageType) => void;
  confirmDestructiveActions?: boolean;
  userId?: string | null;
  onActivity?: (
    item: Omit<RecentActivityItem, "id" | "source" | "createdAt"> & {
      createdAt?: string;
    },
  ) => void;
};

export function useCashManager({
  onMessage,
  confirmDestructiveActions = true,
  userId,
  onActivity,
}: UseCashManagerOptions) {
  const scopeOptions: ServiceScopeOptions = { userId };
  const previousUserIdRef = useRef<string | null | undefined>(userId);
  const [currentCash, setCurrentCash] = useState<number>(0);
  const [cashList, setCashList] = useState<CashItem[]>([]);
  const [cashSearch, setCashSearch] = useState<string>("");
  const [loadingCash, setLoadingCash] = useState<boolean>(true);
  const [addingCash, setAddingCash] = useState<boolean>(false);
  const [cashName, setCashName] = useState<string>("");
  const [cashBalance, setCashBalance] = useState<string>("");
  const [cashNote, setCashNote] = useState<string>("");
  const [editingCashId, setEditingCashId] = useState<number | null>(null);
  const [isEditingCash, setIsEditingCash] = useState<boolean>(false);

  const fetchCash = async () => {
    if (!userId) {
      setCurrentCash(0);
      setCashList([]);
      setLoadingCash(false);
      return;
    }

    setLoadingCash(true);

    try {
      const safeData = await fetchCashItems(scopeOptions);
      setCashList(safeData);

      const totalCash = safeData.reduce((sum, item) => {
        return roundCurrency(sum + toSafeNumber(item.balance));
      }, 0);

      setCurrentCash(totalCash);
    } catch (error) {
      console.error("Cash verisi alınamadı:", error);
      setCurrentCash(0);
      setCashList([]);
      onMessage("Kasa verisi alınamadı.", "error");
    } finally {
      setLoadingCash(false);
    }
  };

  const resetCashForm = () => {
    setCashName("");
    setCashBalance("");
    setCashNote("");
    setIsEditingCash(false);
    setEditingCashId(null);
  };

  useEffect(() => {
    if (previousUserIdRef.current !== userId) {
      setCurrentCash(0);
      setCashList([]);
      setCashName("");
      setCashBalance("");
      setCashNote("");
      setIsEditingCash(false);
      setEditingCashId(null);
      setCashSearch("");
    }

    if (!userId) {
      setCurrentCash(0);
      setCashList([]);
      setLoadingCash(false);
      setCashName("");
      setCashBalance("");
      setCashNote("");
      setIsEditingCash(false);
      setEditingCashId(null);
    }

    previousUserIdRef.current = userId;
  }, [userId]);

  const handleAddCash = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (addingCash) {
      return;
    }

    if (isBlank(cashName)) {
      onMessage("Kasa adı zorunludur.", "error");
      return;
    }

    const balanceValue = parseNumber(cashBalance);
    if (balanceValue === null) {
      onMessage("Bakiye için geçerli bir sayı girin.", "error");
      return;
    }

    setAddingCash(true);

    const cashPayload: CashMutationInput = {
      name: cashName.trim(),
      balance: roundCurrency(balanceValue),
      note: cashNote.trim() || null,
    };

    try {
      if (isEditingCash && editingCashId !== null) {
        await updateCashItem(editingCashId, cashPayload, scopeOptions);

        resetCashForm();
        await fetchCash();
        onActivity?.({
          entityType: "cash",
          entityId: editingCashId,
          action: "updated",
          actionLabel: "Kasa güncellendi",
          title: cashPayload.name,
          description: "Kasa bakiyesi ve not bilgileri güncellendi.",
          amount: cashPayload.balance,
        });
        onMessage("Kasa güncellendi.", "success");
        return;
      }

      await addCashItem(cashPayload, scopeOptions);

      resetCashForm();
      await fetchCash();
      onActivity?.({
        entityType: "cash",
        entityId: Date.now(),
        action: "created",
        actionLabel: "Kasa eklendi",
        title: cashPayload.name,
        description: "Nakit planına yeni kasa kaydı eklendi.",
        amount: cashPayload.balance,
        createdAt: new Date().toISOString(),
      });
      onMessage("Kasa eklendi.", "success");
    } catch (error) {
      if (isEditingCash && editingCashId !== null) {
        console.error("Cash guncelleme hatasi:", error);
        onMessage(
          error instanceof Error
            ? `Kasa güncellenemedi: ${error.message}`
            : "Kasa güncellenemedi.",
          "error",
        );
      } else {
        console.error("Cash ekleme hatası:", error);
        onMessage(
          error instanceof Error
            ? `Kasa eklenemedi: ${error.message}`
            : "Kasa eklenemedi.",
          "error",
        );
      }
    } finally {
      setAddingCash(false);
    }
  };

  const handleEditCash = (item: CashItem) => {
    setCashName(item.name);
    setCashBalance(String(item.balance));
    setCashNote(item.note || "");
    setIsEditingCash(true);
    setEditingCashId(item.id);
  };

  const handleDeleteCash = async (id: number) => {
    try {
      const relatedPaymentCount = await countPaymentsByCashId(id, scopeOptions);

      if (relatedPaymentCount > 0) {
        onMessage("Bu kasaya bağlı ödeme kayıtları olduğu için silinemez.", "error");
        return;
      }

      if (confirmDestructiveActions) {
        const shouldDelete = window.confirm(
          "Bu kasa kaydını silmek istiyor musunuz?",
        );

        if (!shouldDelete) {
          return;
        }
      }

      await deleteCashItem(id, scopeOptions);

      resetCashForm();
      await fetchCash();
      onActivity?.({
        entityType: "cash",
        entityId: id,
        action: "deleted",
        actionLabel: "Kasa silindi",
        title: `Kasa #${id}`,
        description: "Kasa kaydı nakit planından kaldırıldı.",
        amount: null,
      });
      onMessage("Kasa silindi.", "success");
    } catch (error) {
      console.error("Cash silme hatası:", error);
      onMessage("Kasa silinemedi.", "error");
    }
  };

  const handleCancelCashEdit = () => {
    resetCashForm();
  };

  const filteredCashList = useMemo(() => {
    const normalizedSearch = cashSearch.trim().toLocaleLowerCase("tr-TR");

    if (!normalizedSearch) {
      return cashList;
    }

    return cashList.filter((item) => {
      const name = item.name.toLocaleLowerCase("tr-TR");
      const note = (item.note || "").toLocaleLowerCase("tr-TR");

      return (
        name.includes(normalizedSearch) || note.includes(normalizedSearch)
      );
    });
  }, [cashList, cashSearch]);

  return {
    currentCash,
    cashList,
    filteredCashList,
    cashSearch,
    setCashSearch,
    loadingCash,
    cashName,
    setCashName,
    cashBalance,
    setCashBalance,
    cashNote,
    setCashNote,
    addingCash,
    isEditingCash,
    fetchCash,
    handleAddCash,
    handleEditCash,
    handleDeleteCash,
    handleCancelCashEdit,
  };
}
