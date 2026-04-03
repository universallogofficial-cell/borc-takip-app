import { formatCurrency, formatDateTime } from "@/lib/formatCurrency";
import type {
  CurrencyCode,
  DataHealthSummary,
  OperationsOverviewSummary,
} from "@/types/finance";

type OperationsOverviewProps = {
  summary: OperationsOverviewSummary;
  health: DataHealthSummary;
  recommendedActions: string[];
  currencyCode: CurrencyCode;
  lastSyncedAt: string | null;
};

export default function OperationsOverview({
  summary,
  health,
  recommendedActions,
  currencyCode,
  lastSyncedAt,
}: OperationsOverviewProps) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Operasyon Özeti
          </h3>
          <p className="text-sm text-gray-500">
            Genel durum, veri sağlığı ve kısa aksiyonlar tek alanda gösterilir.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              summary.hasRisk || health.hasIssues
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {summary.hasRisk || health.hasIssues ? "Dikkat gerekli" : "Kontrol altında"}
          </span>
          {lastSyncedAt && (
            <p className="mt-2 text-xs text-gray-500">
              Son veri yenileme: {formatDateTime(lastSyncedAt)}
            </p>
          )}
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Borç Durumu</p>
          <p className="font-semibold text-gray-900">
            {summary.totalDebtCount} toplam / {summary.activeDebtCount} aktif
          </p>
          <p className="text-sm text-gray-500">
            {summary.closedDebtCount} kapanmış kayıt
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Kasa ve Ödeme</p>
          <p className="font-semibold text-gray-900">
            {summary.totalCashAccountCount} kasa / {summary.totalPaymentCount} ödeme
          </p>
          <p className="text-sm text-gray-500">
            Bugün {summary.todayPaymentCount}, son 7 gün {summary.last7DaysPaymentCount}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Bu Ay Ödeme</p>
          <p className="font-semibold text-gray-900">
            {formatCurrency(summary.thisMonthPaymentAmount, currencyCode)}
          </p>
          <p className="text-sm text-gray-500">
            Yaklaşan ödeme: {summary.upcomingPaymentCount}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Veri Kontrolü</p>
          <p className="font-semibold text-gray-900">
            {health.hasIssues ? "Uyarı var" : "Temiz"}
          </p>
          <p className="text-sm text-gray-500">
            {health.hasIssues
              ? "Aşağıdaki tespitleri kontrol edin."
              : "Kritik veri problemi görünmüyor."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-4">
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Veri Kontrolü
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Negatif kalan borç: {health.negativeRemainingDebtCount}</p>
            <p>Negatif kasa bakiyesi: {health.negativeCashBalanceCount}</p>
            <p>Eksik payment ilişkisi: {health.missingPaymentRelationCount}</p>
            <p>Geçersiz ödeme günü: {health.invalidDueDayCount}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Önerilen Aksiyonlar
          </h4>
          <div className="space-y-2">
            {recommendedActions.map((action) => (
              <div
                key={action}
                className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700"
              >
                {action}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
