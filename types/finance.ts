export type CashItem = {
  id: number;
  created_at: string;
  user_id?: string | null;
  name: string;
  balance: number;
  note: string | null;
};

export type DebtRow = {
  id: number;
  created_at: string;
  user_id?: string | null;
  name: string;
  institution: string | null;
  product_type: string | null;
  remaining_debt: number | null;
  minimum_payment: number | null;
  rate: number | null;
  due_day: number | null;
};

export type DebtTableItem = {
  id: number;
  name: string;
  type: string;
  amount: string;
  rawAmount: string;
  dueDate: string;
  status: string;
};

export type SummaryCard = {
  title: string;
  value: string;
};

export type DebtTab = "all" | "credit_card" | "loan" | "other";
export type DebtLifecycleStatus = "active" | "closed";
export type FlashMessageType = "success" | "error";

export type FlashMessage = {
  text: string;
  type: FlashMessageType;
};

export type CurrencyCode = "TRY" | "USD" | "EUR";

export type AppSettings = {
  currencyCode: CurrencyCode;
  confirmDestructiveActions: boolean;
};

export type ServiceScopeOptions = {
  userId?: string | null;
};

export type AuthContext = {
  userId: string | null;
  mode: "demo" | "scoped";
};

export type RecentActivityItem = {
  id: string;
  source: "derived" | "runtime";
  entityType: "debt" | "cash" | "payment";
  entityId: number;
  action:
    | "created"
    | "updated"
    | "deleted"
    | "payment_made"
    | "payment_updated"
    | "payment_deleted";
  actionLabel: string;
  title: string;
  description: string;
  amount: number | null;
  createdAt: string;
};

export type DashboardTrendItem = {
  label: string;
  value: string;
  description: string;
};

export type CashMutationInput = {
  user_id?: string | null;
  name: string;
  balance: number;
  note: string | null;
};

export type DebtMutationInput = {
  user_id?: string | null;
  name: string;
  institution: string | null;
  product_type: string | null;
  remaining_debt: number;
  minimum_payment: number | null;
  rate: number | null;
  due_day: number | null;
};

export type Payment = {
  id: number;
  created_at: string;
  user_id?: string | null;
  debt_id: number;
  cash_id: number;
  amount: number;
  note: string | null;
};

export type PaymentFormData = {
  debtId: string;
  cashId: string;
  amount: string;
  note: string;
};

export type PaymentFilter = "all" | "today" | "last_7_days" | "this_month";

export type PaymentListRow = {
  id: number;
  createdAt: string;
  debtName: string;
  cashName: string;
  amount: number;
  note: string | null;
};

export type ClosedDebtItem = {
  id: number;
  name: string;
  institution: string;
  productType: string;
  remainingDebt: number;
  status: DebtLifecycleStatus;
};

export type AppBackup = {
  version: "1.0";
  exportedAt: string;
  ownerUserId?: string | null;
  debts: DebtRow[];
  cash: CashItem[];
  payments: Payment[];
};

export type BackupPreview = {
  fileName: string;
  version: string;
  exportedAt: string;
  debtCount: number;
  cashCount: number;
  paymentCount: number;
};

export type UpcomingPaymentStatus =
  | "today"
  | "approaching"
  | "passed"
  | "later_this_month";

export type UpcomingPaymentItem = {
  id: number;
  debtName: string;
  institution: string;
  dueDay: number;
  minimumPayment: number;
  remainingDebt: number;
  status: UpcomingPaymentStatus;
};

export type UpcomingPaymentSummary = {
  dueThisMonthCount: number;
  totalMinimumPayment: number;
  urgentCount: number;
};

export type DebtPriorityItem = {
  id: number;
  debtName: string;
  institution: string;
  remainingDebt: number;
  minimumPayment: number;
  dueDay: number | null;
  score: number;
  reasons: string[];
  summary: string;
};

export type CashRiskSummary = {
  currentCash: number;
  nearTermObligation: number;
  monthlyMinimumLoad: number;
  safeSpendableBalance: number;
  coverageRatio: number;
  isInsufficient: boolean;
  gap: number;
  statusLabel: string;
  summaryText: string;
  warnings: string[];
};

export type MonthlyPerformanceSummary = {
  thisMonthPaymentTotal: number;
  last30DaysPaymentTotal: number;
  closedDebtCount: number;
  activeDebtCount: number;
  totalMinimumPaymentLoad: number;
};

export type PayoffStrategy =
  | "highest_interest"
  | "smallest_balance"
  | "nearest_due";

export type PayoffPlannerItem = {
  id: number;
  debtName: string;
  institution: string;
  remainingDebt: number;
  minimumPayment: number;
  rate: number;
  dueDay: number | null;
  suggestedExtraPayment: number;
  reason: string;
  drivers: string[];
};

export type PayoffScenario = {
  strategy: PayoffStrategy;
  strategyLabel: string;
  strategyTag: string;
  activeDebtCount: number;
  extraBudget: number;
  currentCash: number;
  minimumPaymentLoad: number;
  totalRequiredCash: number;
  availableAfterMinimums: number;
  canCoverMinimums: boolean;
  canCoverPlan: boolean;
  feasibilityLabel: string;
  summaryNote: string;
  recommendations: PayoffPlannerItem[];
};

export type OperationsOverviewSummary = {
  totalDebtCount: number;
  activeDebtCount: number;
  closedDebtCount: number;
  totalCashAccountCount: number;
  totalPaymentCount: number;
  todayPaymentCount: number;
  last7DaysPaymentCount: number;
  thisMonthPaymentAmount: number;
  upcomingPaymentCount: number;
  hasRisk: boolean;
};

export type DataHealthSummary = {
  negativeRemainingDebtCount: number;
  negativeCashBalanceCount: number;
  missingPaymentRelationCount: number;
  invalidDueDayCount: number;
  hasIssues: boolean;
};
