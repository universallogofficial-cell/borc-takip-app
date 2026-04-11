"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import AuthGate from "@/components/AuthGate";
import BackupPanel from "@/components/BackupPanel";
import CashForm from "@/components/CashForm";
import OnboardingEmptyState from "@/components/OnboardingEmptyState";
import PayoffPlanner from "@/components/PayoffPlanner";
import SettingsPanel from "@/components/SettingsPanel";
import UpcomingPayments from "@/components/UpcomingPayments";
import CashPanel from "@/components/CashPanel";
import ClosedDebts from "@/components/ClosedDebts";
import DebtForm from "@/components/DebtForm";
import DebtTable from "@/components/DebtTable";
import PageHeader from "@/components/PageHeader";
import PaymentForm from "@/components/PaymentForm";
import PaymentList from "@/components/PaymentList";
import Tabs from "@/components/Tabs";
import { useCashManager } from "@/hooks/useCashManager";
import { useDebtManager } from "@/hooks/useDebtManager";
import { usePaymentManager } from "@/hooks/usePaymentManager";
import {
  buildBackupPreview,
  createBackupPayload,
  downloadBackupJson,
  parseBackupPayload,
} from "@/lib/backup";
import {
  buildAuthContext,
  getCurrentSession,
  getAuthModeLabel,
  signInWithMagicLink,
  signOutUser,
  subscribeToAuthChanges,
} from "@/lib/auth";
import { exportCsv } from "@/lib/exportCsv";
import { getDebtLifecycleStatus } from "@/lib/debtLifecycle";
import { roundCurrency, toSafeNumber } from "@/lib/financeMath";
import { formatCurrency, formatDateTime } from "@/lib/formatCurrency";
import { buildPayoffScenario, parsePayoffExtraBudget } from "@/lib/payoffPlanner";
import { addCashItem } from "@/lib/cashService";
import { addDebtItem } from "@/lib/debtService";
import { createPaymentItem } from "@/lib/paymentService";
import { buildCashRiskSummary } from "@/lib/riskOverview";
import { buildUpcomingPayments } from "@/lib/upcomingPayments";
import type {
  AppBackup,
  AppSettings,
  BackupPreview,
  CurrencyCode,
  FlashMessage,
  FlashMessageType,
  PayoffStrategy,
  RecentActivityItem,
  UserProfile,
} from "@/types/finance";

export type AppSection = "dashboard" | "debts" | "cash" | "payments" | "settings";

const ACTIVITY_STORAGE_KEY = "borc-takip-recent-activity";
const SETTINGS_STORAGE_KEY = "borc-takip-settings";
const PROFILE_STORAGE_KEY = "borc-takip-user-profile";
const defaultSettings: AppSettings = {
  currencyCode: "TRY",
  confirmDestructiveActions: true,
};
const defaultProfile: UserProfile = {
  firstName: "",
  lastName: "",
};

const pageConfig: Record<AppSection, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Genel durum",
    subtitle: "Borç, nakit ve ödeme akışını sade bir düzende izle.",
  },
  debts: {
    title: "Borçlar",
    subtitle: "Borç kayıtlarını düzenle, filtrele ve arşivi sessizce takip et.",
  },
  cash: {
    title: "Nakit",
    subtitle: "Bakiyelerini düzenle ve ödeme etkilerini tek yerde izle.",
  },
  payments: {
    title: "Ödemeler",
    subtitle: "Ödeme kayıtlarını oluştur, güncelle ve geçmişi koru.",
  },
  settings: {
    title: "Ayarlar",
    subtitle: "Tercihlerini ve yedeklerini sakin bir yerden yönet.",
  },
};

type AppWorkspaceProps = {
  section: AppSection;
};

function SkeletonLine({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[rgba(15,61,46,0.08)] ${className}`}
    />
  );
}

function SectionLoadingState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="finance-panel p-5">
      <div className="mb-4">
        <p className="text-sm font-medium text-[#1f2924]">{title}</p>
        <p className="text-sm text-[#65716a]">{description}</p>
      </div>
      <div className="space-y-3">
        <SkeletonLine className="h-16 w-full" />
        <SkeletonLine className="h-16 w-full" />
        <SkeletonLine className="h-16 w-full" />
      </div>
    </div>
  );
}

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <SkeletonLine className="h-72 w-full rounded-[36px]" />
      <div className="grid gap-3 sm:grid-cols-2">
        <SkeletonLine className="h-28 w-full" />
        <SkeletonLine className="h-28 w-full" />
      </div>
      <SkeletonLine className="h-80 w-full rounded-[32px]" />
    </div>
  );
}

function FinancialSummaryHero({
  currencyCode,
  safeSpendableBalance,
  riskLabel,
  totalDebt,
  currentCash,
}: {
  currencyCode: CurrencyCode;
  safeSpendableBalance: number;
  riskLabel: string;
  totalDebt: number;
  currentCash: number;
}) {
  const badgeClass =
    riskLabel === "Risk altındasın"
      ? "finance-badge finance-badge-danger"
      : riskLabel === "Dikkatli ol"
        ? "finance-badge finance-badge-warn"
        : "finance-badge finance-badge-good";
  const statusLabel =
    riskLabel === "Risk altındasın"
      ? "Denge baskıda"
      : riskLabel === "Dikkatli ol"
        ? "Dikkat gerekli"
        : "Dengede";

  return (
    <section className="overflow-hidden rounded-[40px] bg-[linear-gradient(135deg,#123f31_0%,#0f3328_52%,#183f31_100%)] px-6 py-8 text-white shadow-[0_26px_60px_rgba(15,61,46,0.18)] md:px-8 md:py-10">
      <div className="grid gap-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/50">
            Harcanabilir bakiye
          </p>
          <h2 className="font-display mt-5 text-6xl leading-[0.94] tracking-[-0.05em] text-[#f4f5f1] md:text-7xl">
            {formatCurrency(safeSpendableBalance, currencyCode)}
          </h2>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className={badgeClass}>{statusLabel}</span>
            <p className="text-sm text-white/62">Bugünkü akışına göre güvenli alan</p>
          </div>

          <div className="mt-8">
            <Link href="/app/payments" className="finance-button-primary">
              Ödeme yap
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:max-w-xl sm:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-white/8 px-5 py-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">
              Toplam yükün
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
              {formatCurrency(totalDebt, currencyCode)}
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/8 px-5 py-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">
              Nakitin
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
              {formatCurrency(currentCash, currencyCode)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function getDashboardStatusNote(riskSummary: ReturnType<typeof buildCashRiskSummary>) {
  if (riskSummary.isInsufficient) {
    return "Ödemeler nakdin üzerinde baskı kuruyor.";
  }

  if (riskSummary.warnings.length > 0) {
    return "Nakit akışı dikkat istiyor.";
  }

  return "Görünen akış dengeli.";
}

function DashboardStatusStrip({
  riskLabel,
  statusNote,
}: {
  riskLabel: string;
  statusNote: string;
}) {
  const badgeClass =
    riskLabel === "Risk altındasın"
      ? "finance-badge finance-badge-danger"
      : riskLabel === "Dikkatli ol"
        ? "finance-badge finance-badge-warn"
        : "finance-badge finance-badge-good";
  const badgeLabel =
    riskLabel === "Risk altındasın"
      ? "Baskı var"
      : riskLabel === "Dikkatli ol"
        ? "Dikkat"
        : "Dengede";

  return (
    <div className="flex items-center gap-3 rounded-full border border-[rgba(15,61,46,0.08)] bg-white/72 px-4 py-3 text-sm text-[#65716a] backdrop-blur">
      <span className={badgeClass}>{badgeLabel}</span>
      <span>{statusNote}</span>
    </div>
  );
}

export default function AppWorkspace({ section }: AppWorkspaceProps) {
  const [message, setMessage] = useState<FlashMessage | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authSubmitting, setAuthSubmitting] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authMessageType, setAuthMessageType] = useState<FlashMessageType | null>(
    null,
  );
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [runtimeActivities, setRuntimeActivities] = useState<RecentActivityItem[]>(
    [],
  );
  const [backupPreview, setBackupPreview] = useState<BackupPreview | null>(null);
  const [pendingBackup, setPendingBackup] = useState<AppBackup | null>(null);
  const [isImportingBackup, setIsImportingBackup] = useState<boolean>(false);
  const [selectedPayoffStrategy, setSelectedPayoffStrategy] =
    useState<PayoffStrategy>("highest_interest");
  const [plannerExtraBudget, setPlannerExtraBudget] = useState<string>("");
  const messageTimeoutRef = useRef<number | null>(null);
  const authContext = useMemo(
    () => buildAuthContext(session?.user.id ?? null),
    [session?.user.id],
  );
  const profileStorageKey = useMemo(
    () => (authContext.userId ? `${PROFILE_STORAGE_KEY}:${authContext.userId}` : null),
    [authContext.userId],
  );
  const activityStorageKey = useMemo(
    () => (authContext.userId ? `${ACTIVITY_STORAGE_KEY}:${authContext.userId}` : null),
    [authContext.userId],
  );

  const recordActivity = (
    item: Omit<RecentActivityItem, "id" | "source" | "createdAt"> & {
      createdAt?: string;
    },
  ) => {
    const activity: RecentActivityItem = {
      ...item,
      id: `runtime-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source: "runtime",
      createdAt: item.createdAt || new Date().toISOString(),
    };

    setRuntimeActivities((prev) => [activity, ...prev].slice(0, 40));
  };

  const showMessage = (text: string, type: FlashMessageType = "success") => {
    if (messageTimeoutRef.current !== null) {
      window.clearTimeout(messageTimeoutRef.current);
    }

    setMessage({ text, type });
    messageTimeoutRef.current = window.setTimeout(() => setMessage(null), 2000);
  };

  const showAuthMessage = (
    text: string,
    type: FlashMessageType = "success",
  ) => {
    setAuthMessage(text);
    setAuthMessageType(type);
  };

  const {
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
  } = useCashManager({
    onMessage: showMessage,
    onActivity: recordActivity,
    confirmDestructiveActions: settings.confirmDestructiveActions,
    userId: authContext.userId,
  });

  const {
    debts,
    closedDebtItems,
    loadingDebts,
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
    debtSearch,
    setDebtSearch,
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
  } = useDebtManager({
    onMessage: showMessage,
    onActivity: recordActivity,
    confirmDestructiveActions: settings.confirmDestructiveActions,
    userId: authContext.userId,
  });

  const {
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
  } = usePaymentManager({
    debts,
    cashList,
    onMessage: showMessage,
    onActivity: recordActivity,
    confirmDestructiveActions: settings.confirmDestructiveActions,
    userId: authContext.userId,
    refreshCash: async () => {
      await fetchCash();
    },
    refreshDebts: async () => {
      await fetchDebts();
    },
  });

  const loadInitialData = useEffectEvent(() => {
    if (!authContext.userId) {
      return;
    }

    void fetchCash();
    void fetchDebts();
    void fetchPayments();
  });

  useEffect(() => {
    let isMounted = true;

    void getCurrentSession()
      .then((currentSession) => {
        if (!isMounted) {
          return;
        }

        setSession(currentSession);
        setAuthLoading(false);
      })
      .catch((error) => {
        console.error("Auth oturumu alınamadı:", error);
        if (isMounted) {
          setAuthLoading(false);
          showAuthMessage(
            "Oturum kontrolü tamamlanamadı. Sayfayı yenileyip tekrar deneyin.",
            "error",
          );
        }
      });

    const unsubscribe = subscribeToAuthChanges((nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
      setAuthEmail(nextSession?.user.email || "");
      setAuthMessage(null);
      setAuthMessageType(null);
      setMessage(null);
      setPendingBackup(null);
      setBackupPreview(null);
    });

    const storedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings) as Partial<AppSettings>;
        setSettings({
          currencyCode:
            parsed.currencyCode === "USD" || parsed.currencyCode === "EUR"
              ? parsed.currencyCode
              : "TRY",
          confirmDestructiveActions:
            parsed.confirmDestructiveActions !== false,
        });
      } catch {
        window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
      }
    }

    return () => {
      isMounted = false;
      unsubscribe();

      if (messageTimeoutRef.current !== null) {
        window.clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!authContext.userId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      loadInitialData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [authContext.userId]);

  useEffect(() => {
    if (!profileStorageKey) {
      setProfile(defaultProfile);
      return;
    }

    const storedProfile = window.localStorage.getItem(profileStorageKey);
    if (!storedProfile) {
      setProfile(defaultProfile);
      return;
    }

    try {
      const parsed = JSON.parse(storedProfile) as Partial<UserProfile>;
      setProfile({
        firstName: parsed.firstName?.trim() || "",
        lastName: parsed.lastName?.trim() || "",
      });
    } catch {
      window.localStorage.removeItem(profileStorageKey);
      setProfile(defaultProfile);
    }
  }, [profileStorageKey]);

  useEffect(() => {
    if (!activityStorageKey) {
      setRuntimeActivities([]);
      return;
    }

    const storedActivities = window.localStorage.getItem(activityStorageKey);
    if (!storedActivities) {
      setRuntimeActivities([]);
      return;
    }

    try {
      const parsed = JSON.parse(storedActivities) as RecentActivityItem[];
      setRuntimeActivities(parsed);
    } catch {
      window.localStorage.removeItem(activityStorageKey);
      setRuntimeActivities([]);
    }
  }, [activityStorageKey]);

  useEffect(() => {
    if (!activityStorageKey) {
      return;
    }

    window.localStorage.setItem(
      activityStorageKey,
      JSON.stringify(runtimeActivities),
    );
  }, [activityStorageKey, runtimeActivities]);

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!profileStorageKey) {
      return;
    }

    window.localStorage.setItem(profileStorageKey, JSON.stringify(profile));
  }, [profile, profileStorageKey]);

  const upcomingPaymentItems = useMemo(() => buildUpcomingPayments(debts).items, [debts]);

  const cashRiskSummary = useMemo(
    () => buildCashRiskSummary(debts, currentCash),
    [currentCash, debts],
  );
  const parsedPlannerBudget = useMemo(
    () => parsePayoffExtraBudget(plannerExtraBudget),
    [plannerExtraBudget],
  );
  const payoffScenario = useMemo(
    () =>
      buildPayoffScenario({
        debts,
        currentCash,
        strategy: selectedPayoffStrategy,
        extraBudget: parsedPlannerBudget.value,
      }),
    [currentCash, debts, parsedPlannerBudget.value, selectedPayoffStrategy],
  );
  const safeSpendableBalance = cashRiskSummary.safeSpendableBalance;
  const totalDebtBalance = useMemo(
    () =>
      debts.reduce(
        (sum, item) => roundCurrency(sum + toSafeNumber(item.remaining_debt)),
        0,
      ),
    [debts],
  );
  const isDashboardLoading =
    (loadingCash || loadingDebts || loadingPayments) &&
    cashList.length === 0 &&
    debts.length === 0 &&
    payments.length === 0;
  const isDebtPageLoading = loadingDebts && debts.length === 0;
  const isCashPageLoading = loadingCash && cashList.length === 0;
  const isPlannerLoading =
    (loadingCash || loadingDebts) && debts.length === 0 && cashList.length === 0;
  const hasProfile = Boolean(profile.firstName.trim() && profile.lastName.trim());
  const hasCash = cashList.length > 0;
  const hasDebt = debts.length > 0;
  const hasPayment = payments.length > 0;
  const shouldShowOnboarding =
    !isDashboardLoading && (!hasProfile || !hasCash || !hasDebt || !hasPayment);
  const displayName = hasProfile
    ? `${profile.firstName.trim()} ${profile.lastName.trim()}`
    : session?.user.email || "E-posta bilgisi olmayan hesap";

  const displayDebtTableData = useMemo(
    () =>
      debtTableData.map((item) => ({
        ...item,
        amount: formatCurrency(Number(item.rawAmount), settings.currencyCode),
      })),
    [debtTableData, settings.currencyCode],
  );

  const handleExportCash = () => {
    try {
      exportCsv({
        filename: "kasa-kayitlari.csv",
        headers: ["Kasa Adi", "Bakiye", "Not", "Olusturma Tarihi"],
        rows: filteredCashList.map((item) => [
          item.name,
          formatCurrency(
            roundCurrency(toSafeNumber(item.balance)),
            settings.currencyCode,
          ),
          item.note || "Not yok",
          formatDateTime(item.created_at),
        ]),
      });
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Kasa CSV dışa aktarılamadı.",
        "error",
      );
    }
  };

  const handleExportDebts = () => {
    try {
      exportCsv({
        filename: "borc-kayitlari.csv",
        headers: [
          "Borc Adi",
          "Kurum",
          "Urun Tipi",
          "Kalan Borc",
          "Minimum Odeme",
          "Faiz",
          "Son Odeme Gunu",
          "Durum",
        ],
        rows: filteredDebts.map((item) => [
          item.name,
          item.institution || "-",
          item.product_type || "-",
          formatCurrency(
            roundCurrency(toSafeNumber(item.remaining_debt)),
            settings.currencyCode,
          ),
          item.minimum_payment === null
            ? "-"
            : formatCurrency(
                roundCurrency(toSafeNumber(item.minimum_payment)),
                settings.currencyCode,
              ),
          item.rate === null ? "-" : item.rate,
          item.due_day ?? "-",
          getDebtLifecycleStatus(item.remaining_debt) === "closed"
            ? "Kapanmış"
            : "Aktif",
        ]),
      });
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Borç CSV dışa aktarılamadı.",
        "error",
      );
    }
  };

  const handleEditClosedDebt = (id: number) => {
    const debt = debts.find((item) => item.id === id);

    if (!debt) {
      showMessage("Düzenlenecek borç bulunamadı.", "error");
      return;
    }

    handleEditDebtRow(debt);
  };

  const handleExportPayments = () => {
    try {
      exportCsv({
        filename: "odeme-kayitlari.csv",
        headers: ["Tarih", "Borc", "Kasa", "Tutar", "Not"],
        rows: filteredPaymentRows.map((item) => [
          formatDateTime(item.createdAt),
          item.debtName,
          item.cashName,
          formatCurrency(roundCurrency(item.amount), settings.currencyCode),
          item.note || "Not yok",
        ]),
      });
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Ödeme CSV dışa aktarılamadı.",
        "error",
      );
    }
  };

  const handleExportBackup = () => {
    try {
      const payload = createBackupPayload({
        debts,
        cash: cashList,
        payments,
        ownerUserId: authContext.userId,
      });

      downloadBackupJson(
        payload,
        `borc-takip-yedek-${new Date().toISOString().slice(0, 10)}.json`,
      );
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "JSON yedeği dışa aktarılamadı.",
        "error",
      );
    }
  };

  const handleSelectBackupFile = async (file: File) => {
    try {
      const raw = await file.text();
      const payload = parseBackupPayload(raw);
      setPendingBackup(payload);
      setBackupPreview(buildBackupPreview(payload, file.name));
    } catch (error) {
      setPendingBackup(null);
      setBackupPreview(null);
      console.error("Backup okuma hatası:", error);
      showMessage(
        error instanceof Error
          ? error.message
          : "Yedek dosyası okunamadı. Dosyayı kontrol edip tekrar deneyin.",
        "error",
      );
    }
  };

  const handleClearBackupPreview = () => {
    setPendingBackup(null);
    setBackupPreview(null);
  };

  const handleConfirmBackupImport = async () => {
    if (!pendingBackup || !backupPreview) {
      return;
    }

    if (settings.confirmDestructiveActions) {
      const crossUserWarning =
        pendingBackup.ownerUserId &&
        authContext.userId &&
        pendingBackup.ownerUserId !== authContext.userId
          ? " Bu yedek farklı bir kullanıcıya ait görünüyor; kayıtlar mevcut oturuma aktarılacak."
          : "";
      const shouldImport = window.confirm(
        `JSON içe aktarma ekleme modunda çalışır. Mevcut veriler korunur ve yeni kayıtlar eklenir.${crossUserWarning} Devam edilsin mi?`,
      );

      if (!shouldImport) {
        return;
      }
    }

    setIsImportingBackup(true);

    try {
      const debtIdMap = new Map<number, number>();
      const cashIdMap = new Map<number, number>();

      for (const debt of pendingBackup.debts) {
        const createdDebt = await addDebtItem(
          {
            name: debt.name,
            institution: debt.institution,
            product_type: debt.product_type,
            remaining_debt: roundCurrency(toSafeNumber(debt.remaining_debt)),
            minimum_payment:
              debt.minimum_payment === null
                ? null
                : roundCurrency(toSafeNumber(debt.minimum_payment)),
            rate: debt.rate,
            due_day: debt.due_day,
          },
          { userId: authContext.userId },
        );

        debtIdMap.set(debt.id, createdDebt.id);
      }

      for (const cash of pendingBackup.cash) {
        const createdCash = await addCashItem(
          {
            name: cash.name,
            balance: roundCurrency(toSafeNumber(cash.balance)),
            note: cash.note,
          },
          { userId: authContext.userId },
          true,
        );

        if (!createdCash) {
          throw new Error("İçe aktarılan kasa kaydı için yeni kimlik alınamadı.");
        }

        cashIdMap.set(cash.id, createdCash.id);
      }

      for (const payment of pendingBackup.payments) {
        const mappedDebtId = debtIdMap.get(payment.debt_id);
        const mappedCashId = cashIdMap.get(payment.cash_id);

        if (!mappedDebtId || !mappedCashId) {
          throw new Error("Yedek dosyası ilişkileri içe aktarma sırasında bozuldu.");
        }

        await createPaymentItem(
          {
            debt_id: mappedDebtId,
            cash_id: mappedCashId,
            amount: roundCurrency(toSafeNumber(payment.amount)),
            note: payment.note,
          },
          { userId: authContext.userId },
        );
      }

      await Promise.all([fetchCash(), fetchDebts(), fetchPayments()]);
      showMessage("JSON yedeği ekleme modunda içe aktarıldı.", "success");
      handleClearBackupPreview();
    } catch (error) {
      console.error("Backup içe aktarma hatası:", error);
      showMessage(
        "JSON içe aktarma başarısız oldu. Önizlemeyi kontrol edip tekrar deneyin.",
        "error",
      );
    } finally {
      setIsImportingBackup(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (authSubmitting) {
      return;
    }

    const normalizedEmail = authEmail.trim().toLocaleLowerCase("tr-TR");

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      showAuthMessage("Geçerli bir e-posta adresi girin.", "error");
      return;
    }

    setAuthSubmitting(true);

    try {
      await signInWithMagicLink(normalizedEmail);
      showAuthMessage(
        "Giriş bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu kontrol edin.",
        "success",
      );
    } catch (error) {
      console.error("Auth giriş hatası:", error);
      showAuthMessage(
        "Giriş bağlantısı gönderilemedi. Kısa süre sonra tekrar deneyin.",
        "error",
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setAuthEmail("");
      setProfile(defaultProfile);
      setPendingBackup(null);
      setBackupPreview(null);
      showAuthMessage("Oturum kapatıldı.", "success");
    } catch (error) {
      console.error("Auth çıkış hatası:", error);
      showAuthMessage("Oturum kapatılamadı.", "error");
    }
  };

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedFirstName = profile.firstName.trim();
    const normalizedLastName = profile.lastName.trim();

    if (!normalizedFirstName || !normalizedLastName) {
      showMessage("İsim ve soyisim alanlarını birlikte doldurun.", "error");
      return;
    }

    setProfile({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
    });
    showMessage("Profil bilgileri kaydedildi.", "success");
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f5f1] p-6">
        <div className="w-full max-w-md rounded-[28px] border border-[rgba(15,61,46,0.08)] bg-white/88 p-6 shadow-[0_18px_38px_rgba(20,36,28,0.05)]">
          <p className="text-sm font-medium text-[#1f2924]">Oturum hazırlanıyor</p>
          <p className="mt-1 text-sm text-[#65716a]">
            Hesap durumu kontrol ediliyor. Bu adım genelde birkaç saniye sürer.
          </p>
          <div className="mt-5 space-y-3">
            <SkeletonLine className="h-12 w-full" />
            <SkeletonLine className="h-12 w-full" />
            <SkeletonLine className="h-12 w-2/3" />
          </div>
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <AuthGate
        email={authEmail}
        onEmailChange={setAuthEmail}
        onSubmit={handleAuthSubmit}
        isSubmitting={authSubmitting}
        message={authMessage}
        messageType={authMessageType}
      />
    );
  }

  const currentPage =
    section === "dashboard" && shouldShowOnboarding
      ? {
          title: "Hoş geldin",
          subtitle: "AKÇA ile borçlarını ve nakit akışını düzenlemeye başla.",
        }
      : pageConfig[section];
  const dashboardStatusNote = getDashboardStatusNote(cashRiskSummary);

  return (
    <main className="min-h-screen bg-transparent px-4 pb-10 pt-5 md:px-6 md:pb-14 md:pt-6">
      {message && (
        <div
          className={`finance-toast fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-[18px] px-4 py-3 text-sm font-medium ${
            message.type === "error" ? "finance-toast-error" : "finance-toast-success"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 rounded-[28px] border border-[rgba(15,61,46,0.08)] bg-white/70 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1f2924]">{displayName}</p>
            <p className="mt-1 text-xs text-[#65716a]">
              {getAuthModeLabel(authContext)} • Para birimi: {settings.currencyCode} •
              Veriler bu hesaba özeldir
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="finance-badge finance-badge-good">Oturum açık</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="finance-button-ghost"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {section !== "dashboard" ? (
          <PageHeader title={currentPage.title} subtitle={currentPage.subtitle} />
        ) : null}

        {section === "dashboard" && (
          <>
            {isDashboardLoading ? (
              <DashboardLoadingSkeleton />
            ) : shouldShowOnboarding ? (
              <OnboardingEmptyState
                email={session.user.email || null}
                firstName={profile.firstName}
                lastName={profile.lastName}
                onFirstNameChange={(value) =>
                  setProfile((prev) => ({ ...prev, firstName: value }))
                }
                onLastNameChange={(value) =>
                  setProfile((prev) => ({ ...prev, lastName: value }))
                }
                onSaveProfile={handleSaveProfile}
                hasProfile={hasProfile}
                hasCash={hasCash}
                hasDebt={hasDebt}
                hasPayment={hasPayment}
              />
            ) : (
              <div className="space-y-8">
                <FinancialSummaryHero
                  currencyCode={settings.currencyCode}
                  safeSpendableBalance={safeSpendableBalance}
                  riskLabel={cashRiskSummary.statusLabel}
                  totalDebt={totalDebtBalance}
                  currentCash={currentCash}
                />

                <DashboardStatusStrip
                  riskLabel={cashRiskSummary.statusLabel}
                  statusNote={dashboardStatusNote}
                />

                <UpcomingPayments
                  items={upcomingPaymentItems.slice(0, 5)}
                  currencyCode={settings.currencyCode}
                />
              </div>
            )}
          </>
        )}

        {section === "debts" && (
          <>
            <DebtForm
              debtName={debtName}
              setDebtName={setDebtName}
              institution={institution}
              setInstitution={setInstitution}
              productType={productType}
              setProductType={setProductType}
              remainingDebt={remainingDebt}
              setRemainingDebt={setRemainingDebt}
              minimumPayment={minimumPayment}
              setMinimumPayment={setMinimumPayment}
              rate={rate}
              setRate={setRate}
              dueDay={dueDay}
              setDueDay={setDueDay}
              addingDebt={addingDebt}
              isEditingDebt={isEditingDebt}
              editingDebtId={editingDebtId}
              onSubmit={handleAddDebt}
              onCancel={handleCancelDebtEdit}
            />

            {isPlannerLoading ? (
              <SectionLoadingState
                title="Borç kapatma stratejisi hazırlanıyor"
                description="Nakit ve borç verileri eşleştiriliyor. Öncelik önerileri kısa süre içinde görünecek."
              />
            ) : (
              <PayoffPlanner
                strategy={selectedPayoffStrategy}
                extraBudget={plannerExtraBudget}
                onStrategyChange={setSelectedPayoffStrategy}
                onExtraBudgetChange={setPlannerExtraBudget}
                scenario={payoffScenario}
                validationError={parsedPlannerBudget.error}
                currencyCode={settings.currencyCode}
              />
            )}

            {isDebtPageLoading && (
              <SectionLoadingState
                title="Borç kayıtları yükleniyor"
                description="Aktif ve kapanan borçlar hazırlanıyor. Liste birkaç saniye içinde görüntülenecek."
              />
            )}

            {!isDebtPageLoading && (
              <div className="space-y-4">
                <Tabs selectedTab={selectedTab} onChangeTab={setSelectedTab} />

                <DebtTable
                  debts={displayDebtTableData}
                  debtSearch={debtSearch}
                  onDebtSearchChange={setDebtSearch}
                  onExportDebts={handleExportDebts}
                  onEdit={handleEditDebt}
                  onDelete={handleDeleteDebt}
                />

                <ClosedDebts
                  debts={closedDebtItems}
                  currencyCode={settings.currencyCode}
                  onEditDebt={handleEditClosedDebt}
                  onDeleteDebt={handleDeleteDebt}
                />
              </div>
            )}
          </>
        )}

        {section === "cash" && (
          <>
            <CashForm
              cashName={cashName}
              setCashName={setCashName}
              cashBalance={cashBalance}
              setCashBalance={setCashBalance}
              cashNote={cashNote}
              setCashNote={setCashNote}
              addingCash={addingCash}
              isEditingCash={isEditingCash}
              onSubmit={handleAddCash}
              onCancel={handleCancelCashEdit}
            />

            {isCashPageLoading && (
              <SectionLoadingState
                title="Kasa kayıtları yükleniyor"
                description="Bakiyeler ve son durum hazırlanıyor. Liste kısa süre içinde görüntülenecek."
              />
            )}

            {!isCashPageLoading && (
              <CashPanel
                currentCash={currentCash}
                cashList={filteredCashList}
                currencyCode={settings.currencyCode}
                cashSearch={cashSearch}
                onCashSearchChange={setCashSearch}
                onExportCash={handleExportCash}
                onEditCash={handleEditCash}
                onDeleteCash={handleDeleteCash}
              />
            )}
          </>
        )}

        {section === "payments" && (
          <div className="grid gap-6 xl:grid-cols-2">
            <PaymentForm
              debts={debts}
              cashList={cashList}
              paymentForm={paymentForm}
              setPaymentForm={setPaymentForm}
              currencyCode={settings.currencyCode}
              addingPayment={addingPayment}
              isEditingPayment={editingPaymentId !== null}
              editingPaymentId={editingPaymentId}
              onSubmit={handleAddPayment}
              onCancel={handleCancelPaymentEdit}
            />

            <PaymentList
              payments={visiblePaymentRows}
              loadingPayments={loadingPayments}
              deletingPaymentId={deletingPaymentId}
              editingPaymentId={editingPaymentId}
              currencyCode={settings.currencyCode}
              selectedFilter={selectedPaymentFilter}
              paymentSearch={paymentSearch}
              paymentMinAmount={paymentMinAmount}
              paymentMaxAmount={paymentMaxAmount}
              onChangeFilter={handleChangePaymentFilter}
              onChangePaymentSearch={handleChangePaymentSearch}
              onChangePaymentMinAmount={handleChangePaymentMinAmount}
              onChangePaymentMaxAmount={handleChangePaymentMaxAmount}
              onEditPayment={handleEditPayment}
              onDeletePayment={handleDeletePayment}
              onExportPayments={handleExportPayments}
              hasAnyPayments={paymentRows.length > 0}
              totalPaymentCount={paymentRows.length}
              filteredPaymentCount={filteredPaymentRows.length}
              totalPaymentAmount={totalPaymentAmount}
              filteredPaymentAmount={filteredPaymentAmount}
              last30DaysPaymentAmount={last30DaysPaymentAmount}
              hasMorePayments={hasMorePayments}
              onLoadMore={handleLoadMorePayments}
            />
          </div>
        )}

        {section === "settings" && (
          <div className="grid gap-6 xl:grid-cols-2">
            <SettingsPanel
              settings={settings}
              onCurrencyChange={(currencyCode: CurrencyCode) =>
                setSettings((prev) => ({ ...prev, currencyCode }))
              }
              onToggleConfirmations={(confirmDestructiveActions: boolean) =>
                setSettings((prev) => ({ ...prev, confirmDestructiveActions }))
              }
            />

            <BackupPanel
              preview={backupPreview}
              isImporting={isImportingBackup}
              onExport={handleExportBackup}
              onFileSelect={handleSelectBackupFile}
              onConfirmImport={handleConfirmBackupImport}
              onClearPreview={handleClearBackupPreview}
            />
          </div>
        )}
      </div>
    </main>
  );
}
