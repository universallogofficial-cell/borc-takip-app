import type { AppBackup, BackupPreview, CashItem, DebtRow, Payment } from "@/types/finance";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNullableString(value: unknown) {
  return value === null || typeof value === "string";
}

function isNullableNumber(value: unknown) {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function isDebtRow(value: unknown): value is DebtRow {
  return (
    isObject(value) &&
    typeof value.id === "number" &&
    typeof value.created_at === "string" &&
    typeof value.name === "string" &&
    isNullableString(value.institution) &&
    isNullableString(value.product_type) &&
    isNullableNumber(value.remaining_debt) &&
    isNullableNumber(value.minimum_payment) &&
    isNullableNumber(value.rate) &&
    isNullableNumber(value.due_day)
  );
}

function isCashItem(value: unknown): value is CashItem {
  return (
    isObject(value) &&
    typeof value.id === "number" &&
    typeof value.created_at === "string" &&
    typeof value.name === "string" &&
    typeof value.balance === "number" &&
    Number.isFinite(value.balance) &&
    isNullableString(value.note)
  );
}

function isPayment(value: unknown): value is Payment {
  return (
    isObject(value) &&
    typeof value.id === "number" &&
    typeof value.created_at === "string" &&
    typeof value.debt_id === "number" &&
    typeof value.cash_id === "number" &&
    typeof value.amount === "number" &&
    Number.isFinite(value.amount) &&
    isNullableString(value.note)
  );
}

function hasDuplicateIds(values: Array<{ id: number }>) {
  return new Set(values.map((item) => item.id)).size !== values.length;
}

export function createBackupPayload({
  debts,
  cash,
  payments,
  ownerUserId,
}: {
  debts: DebtRow[];
  cash: CashItem[];
  payments: Payment[];
  ownerUserId?: string | null;
}): AppBackup {
  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    ownerUserId: ownerUserId || null,
    debts,
    cash,
    payments,
  };
}

export function downloadBackupJson(payload: AppBackup, fileName: string) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("JSON dışa aktarma yalnızca tarayıcı ortamında çalışır.");
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

export function parseBackupPayload(raw: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("JSON dosyası okunamadı.");
  }

  if (!isObject(parsed)) {
    throw new Error("Yedek dosyası geçerli bir obje içermiyor.");
  }

  if (
    parsed.version !== "1.0" ||
    typeof parsed.exportedAt !== "string" ||
    !Array.isArray(parsed.debts) ||
    !Array.isArray(parsed.cash) ||
    !Array.isArray(parsed.payments)
  ) {
    throw new Error("Yedek dosyası beklenen yapıda değil.");
  }

  if (
    "ownerUserId" in parsed &&
    parsed.ownerUserId !== null &&
    typeof parsed.ownerUserId !== "string"
  ) {
    throw new Error("Yedek dosyasındaki owner bilgisi geçersiz.");
  }

  if (Number.isNaN(new Date(parsed.exportedAt).getTime())) {
    throw new Error("Yedek dosyası geçerli bir dışa aktarma tarihi içermiyor.");
  }

  if (
    !parsed.debts.every(isDebtRow) ||
    !parsed.cash.every(isCashItem) ||
    !parsed.payments.every(isPayment)
  ) {
    throw new Error("Yedek dosyasındaki kayıt yapıları geçersiz.");
  }

  if (
    hasDuplicateIds(parsed.debts) ||
    hasDuplicateIds(parsed.cash) ||
    hasDuplicateIds(parsed.payments)
  ) {
    throw new Error("Yedek dosyasında tekrarlanan kayıt kimlikleri bulundu.");
  }

  const debtIds = new Set(parsed.debts.map((item) => item.id));
  const cashIds = new Set(parsed.cash.map((item) => item.id));
  const hasBrokenPaymentRelation = parsed.payments.some(
    (item) => !debtIds.has(item.debt_id) || !cashIds.has(item.cash_id),
  );

  if (hasBrokenPaymentRelation) {
    throw new Error("Yedek dosyasındaki ödeme ilişkileri geçersiz.");
  }

  return parsed as AppBackup;
}

export function buildBackupPreview(
  payload: AppBackup,
  fileName: string,
): BackupPreview {
  return {
    fileName,
    version: payload.version,
    exportedAt: payload.exportedAt,
    debtCount: payload.debts.length,
    cashCount: payload.cash.length,
    paymentCount: payload.payments.length,
  };
}
