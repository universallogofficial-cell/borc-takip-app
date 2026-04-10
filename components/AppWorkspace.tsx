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
import {
  buildCashRiskSummary,
  buildMonthlyPerformanceSummary,
} from "@/lib/riskOverview";
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
    title: "Dashboard",
    subtitle: "Genel finans görünümü, risk durumu ve son aktiviteler burada.",
  },
  debts: {
    title: "Borçlar",
    subtitle:
      "Borç kayıtlarını yönetin, filtreleyin ve kapanan kayıtları arşivde izleyin.",
  },
  cash: {
    title: "Kasalar",
    subtitle: "Kasa bakiyelerini yönetin, arayın ve ödeme etkilerini takip edin.",
  },
  payments: {
    title: "Ödemeler",
    subtitle: "Ödeme kayıtlarını oluşturun, düzenleyin ve ödeme geçmişini izleyin.",
  },
  settings: {
    title: "Ayarlar",
    subtitle: "Görüntüleme tercihleri ve yedekleme işlemleri burada tutulur.",
  },
};

type AppWorkspaceProps = {
  section: AppSection;
};

function SkeletonLine({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />;
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
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
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
    <div className="space-y-6">
      <SkeletonLine className="h-64 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SkeletonLine className="h-28 w-full" />
        <SkeletonLine className="h-28 w-full" />
        <SkeletonLine className="h-28 w-full" />
        <SkeletonLine className="h-28 w-full" />
      </div>
      <SkeletonLine className="h-24 w-full" />
      <div className="grid gap-6 xl:grid-cols-2">
        <SkeletonLine className="h-72 w-full" />
        <SkeletonLine className="h-72 w-full" />
      </div>
    </div>
  );
}

function FinancialSummaryHero({
  currencyCode,
  safeSpendableBalance,
  riskLabel,
  statusNote,
}: {
  currencyCode: CurrencyCode;
  safeSpendableBalance: number;
  riskLabel: string;
  statusNote: string;
}) {
  const toneClass =
    riskLabel === "Risk altındasın"
      ? "from-red-50 via-white to-orange-50"
      : riskLabel === "Dikkatli ol"
        ? "from-amber-50 via-white to-yellow-50"
        : "from-emerald-50 via-white to-cyan-50";
  const badgeClass =
    riskLabel === "Risk altındasın"
      ? "finance-badge finance-badge-danger"
      : riskLabel === "Dikkatli ol"
        ? "finance-badge finance-badge-warn"
        : "finance-badge finance-badge-good";

  return (
    <section className={`finance-surface-strong overflow-hidden rounded-[36px] bg-gradient-to-br ${toneClass} p-6 md:p-8`}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div className="max-w-3xl">
          <p className="finance-kicker">Finansal Durum</p>
          <h2 className="mt-4 text-5xl font-semibold tracking-tight text-slate-950 md:text-6xl">
            {formatCurrency(safeSpendableBalance, currencyCode)}
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Güvenli harcayabileceğin tutar
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 xl:items-end">
          <span className={badgeClass}>{riskLabel}</span>
          <p className="max-w-sm text-sm leading-6 text-slate-600 xl:text-right">
            {statusNote}
          </p>
        </div>
      </div>
    </section>
  );
}

function DashboardMetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="finance-surface rounded-[24px] p-4 md:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

function DashboardSignal({
  title,
  summary,
}: {
  title: string;
  summary: string;
}) {
  return (
    <section className="finance-surface rounded-[28px] p-5 md:p-6">
      <p className="finance-kicker">Risk / Öneri</p>
      <h3 className="mt-2 text-xl font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{summary}</p>
    </section>
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

  const { items: upcomingPaymentItems, summary: upcomingPaymentSummary } =
    useMemo(() => buildUpcomingPayments(debts), [debts]);

  const cashRiskSummary = useMemo(
    () => buildCashRiskSummary(debts, currentCash),
    [currentCash, debts],
  );
  const monthlyPerformance = useMemo(
    () =>
      buildMonthlyPerformanceSummary({
        debts,
        thisMonthPaymentTotal: thisMonthPaymentAmount,
        last30DaysPaymentTotal: last30DaysPaymentAmount,
      }),
    [debts, last30DaysPaymentAmount, thisMonthPaymentAmount],
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

  const derivedActivities = useMemo<RecentActivityItem[]>(() => {
    const debtActivities: RecentActivityItem[] = debts.map((item) => ({
      id: `derived-debt-created-${item.id}`,
      source: "derived",
      entityType: "debt",
      entityId: item.id,
      action: "created",
      actionLabel: "Borç eklendi",
      title: item.name,
      description:
        item.institution && item.product_type
          ? `${item.institution} • ${item.product_type}`
          : item.institution || item.product_type || "Borç portföye eklendi.",
      amount: roundCurrency(toSafeNumber(item.remaining_debt)),
      createdAt: item.created_at,
    }));

    const cashActivities: RecentActivityItem[] = cashList.map((item) => ({
      id: `derived-cash-created-${item.id}`,
      source: "derived",
      entityType: "cash",
      entityId: item.id,
      action: "created",
      actionLabel: "Kasa eklendi",
      title: item.name,
      description: item.note || "Bakiye planlamasına dahil edildi.",
      amount: roundCurrency(toSafeNumber(item.balance)),
      createdAt: item.created_at,
    }));

    const paymentActivities: RecentActivityItem[] = payments.map((item) => {
      const paymentRow = paymentRows.find((row) => row.id === item.id);

      return {
        id: `derived-payment-created-${item.id}`,
        source: "derived",
        entityType: "payment",
        entityId: item.id,
        action: "payment_made",
        actionLabel: "Ödeme yapıldı",
        title: paymentRow?.debtName || `Ödeme #${item.id}`,
        description:
          paymentRow?.cashName
            ? `${paymentRow.cashName} kasasından işlendi.`
            : "Ödeme hareketi kaydedildi.",
        amount: roundCurrency(toSafeNumber(item.amount)),
        createdAt: item.created_at,
      };
    });

    return [...paymentActivities, ...debtActivities, ...cashActivities];
  }, [cashList, debts, paymentRows, payments]);

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
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm font-medium text-gray-900">Oturum hazırlanıyor</p>
          <p className="mt-1 text-sm text-gray-500">
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
          subtitle: "Borçlarını ve nakit durumunu yönetmeye başla.",
        }
      : pageConfig[section];

  return (
    <main className="min-h-screen bg-transparent p-4 md:p-6">
      {message && (
        <div
          className={`finance-toast fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-[18px] px-4 py-3 text-sm font-medium ${
            message.type === "error" ? "finance-toast-error" : "finance-toast-success"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="finance-panel flex flex-col gap-4 rounded-[30px] p-4 sm:flex-row sm:items-center sm:justify-between md:px-5 md:py-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950">
              {displayName}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {getAuthModeLabel(authContext)} • Para birimi: {settings.currencyCode} •
              Veriler bu hesaba özeldir
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Verileriniz oturum bazında ayrılır ve yalnızca bu hesap kapsamında gösterilir.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="finance-badge finance-badge-good">
              Oturum açık
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="finance-button-ghost"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        <PageHeader title={currentPage.title} subtitle={currentPage.subtitle} />

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
              <>
                <FinancialSummaryHero
                  currencyCode={settings.currencyCode}
                  safeSpendableBalance={safeSpendableBalance}
                  riskLabel={cashRiskSummary.statusLabel}
                  statusNote={
                    cashRiskSummary.isInsufficient
                      ? "Mevcut görünümde nakit akışı baskı altında."
                      : cashRiskSummary.warnings.length > 0
                        ? "Mevcut durumda finansal denge dikkat istiyor."
                        : "Mevcut durumda finansal denge stabil."
                  }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <DashboardMetricCard
                    label="Bu Ay Toplam Borç"
                    value={formatCurrency(totalDebtBalance, settings.currencyCode)}
                  />
                  <DashboardMetricCard
                    label="Yaklaşan Ödeme"
                    value={String(upcomingPaymentSummary.urgentCount)}
                  />
                  <DashboardMetricCard
                    label="Toplam Nakit"
                    value={formatCurrency(currentCash, settings.currencyCode)}
                  />
                  <DashboardMetricCard
                    label="Bu Ay Ödenen"
                    value={formatCurrency(thisMonthPaymentAmount, settings.currencyCode)}
                  />
                </div>

                <section className="finance-surface rounded-[28px] p-5 md:p-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="finance-kicker">Ana Aksiyonlar</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950">
                        Bir sonraki adımı seç
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-3">
                    <Link
                      href="/app/debts"
                      className="finance-button-primary"
                    >
                      Borç Ekle
                    </Link>
                    <Link
                      href="/app/payments"
                      className="finance-button-secondary"
                    >
                      Ödeme Yap
                    </Link>
                    <Link
                      href="/app/cash"
                      className="finance-button-ghost"
                    >
                      Kasa Ekle
                    </Link>
                    </div>
                  </div>
                </section>

                <DashboardSignal
                  title={cashRiskSummary.statusLabel}
                  summary={
                    cashRiskSummary.warnings.length > 0
                      ? cashRiskSummary.warnings[0]
                      : cashRiskSummary.summaryText
                  }
                />

                <UpcomingPayments
                  items={upcomingPaymentItems.slice(0, 5)}
                  summary={upcomingPaymentSummary}
                  currencyCode={settings.currencyCode}
                />
              </>
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
