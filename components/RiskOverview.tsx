import { formatCurrency } from "@/lib/formatCurrency";
import type {
  CashRiskSummary,
  CurrencyCode,
  DebtPriorityItem,
  MonthlyPerformanceSummary,
} from "@/types/finance";

type RiskOverviewProps = {
  priorities: DebtPriorityItem[];
  cashRisk: CashRiskSummary;
  performance: MonthlyPerformanceSummary;
  currencyCode: CurrencyCode;
};

export default function RiskOverview({
  priorities,
  cashRisk,
  performance,
  currencyCode,
}: RiskOverviewProps) {
  const riskTone = cashRisk.isInsufficient
    ? "border-red-200 bg-red-50 text-red-800"
    : cashRisk.safeSpendableBalance < 0 || cashRisk.warnings.length > 0
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <section className="finance-panel p-5 md:p-6">
      <div className="mb-5">
        <p className="finance-kicker">
          Risk Merkezi
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">
          Risk ve Öncelik
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Nakit riski, öncelik sırası ve aylık baskı tek karar ekranında toplanır.
        </p>
      </div>

      <div className={`mb-5 rounded-[24px] border p-4 md:p-5 ${riskTone}`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
              Risk Durumu
            </p>
            <p className="mt-1 text-xl font-semibold">{cashRisk.statusLabel}</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 opacity-90">
              {cashRisk.summaryText}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 md:min-w-[360px]">
            <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-black/5">
              <p className="text-xs uppercase tracking-wide opacity-70">Mevcut Nakit</p>
              <p className="mt-1 font-semibold">
                {formatCurrency(cashRisk.currentCash, currencyCode)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-black/5">
              <p className="text-xs uppercase tracking-wide opacity-70">Yakın Dönem</p>
              <p className="mt-1 font-semibold">
                {formatCurrency(cashRisk.nearTermObligation, currencyCode)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-black/5">
              <p className="text-xs uppercase tracking-wide opacity-70">Güvenli Bakiye</p>
              <p className="mt-1 font-semibold">
                {formatCurrency(cashRisk.safeSpendableBalance, currencyCode)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="finance-stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Yakın Dönem Yükümlülük
          </p>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            {formatCurrency(cashRisk.nearTermObligation, currencyCode)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Mevcut nakit: {formatCurrency(cashRisk.currentCash, currencyCode)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Kapsama oranı: %{Math.round(cashRisk.coverageRatio * 100)}
          </p>
        </div>

        <div className="finance-stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Minimum Ödeme ve Güvenli Alan
          </p>
          <p
            className={`mt-2 text-lg font-semibold ${
              cashRisk.safeSpendableBalance < 0 ? "text-red-600" : "text-emerald-700"
            }`}
          >
            {cashRisk.safeSpendableBalance < 0
              ? `${formatCurrency(Math.abs(cashRisk.safeSpendableBalance), currencyCode)} açık`
              : `${formatCurrency(cashRisk.safeSpendableBalance, currencyCode)} serbest alan`}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Toplam minimum ödeme:{" "}
            {formatCurrency(cashRisk.monthlyMinimumLoad, currencyCode)}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {cashRisk.warnings.length === 0 ? (
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                Kritik uyarı yok
              </span>
            ) : (
              cashRisk.warnings.map((warning) => (
                <span
                  key={warning}
                  className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                >
                  {warning}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="finance-stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Aylık Performans
          </p>
          <div className="mt-1 space-y-1 text-sm text-gray-700">
            <p>
              Bu ay ödeme: {formatCurrency(performance.thisMonthPaymentTotal, currencyCode)}
            </p>
            <p>
              Son 30 gün: {formatCurrency(performance.last30DaysPaymentTotal, currencyCode)}
            </p>
            <p>Aktif borç: {performance.activeDebtCount}</p>
            <p>Kapanan borç: {performance.closedDebtCount}</p>
            <p>
              Toplam min. yük: {formatCurrency(performance.totalMinimumPaymentLoad, currencyCode)}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Öncelikli Borçlar
        </h4>

        {priorities.length === 0 ? (
          <div className="finance-empty p-4 text-sm text-slate-500">
            Önceliklendirilecek aktif borç kaydı yok.
          </div>
        ) : (
          <div className="space-y-3">
            {priorities.map((item, index) => (
              <div
                key={item.id}
                className="rounded-[24px] border border-slate-200/80 bg-white/92 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="finance-badge bg-slate-950 text-white">
                        #{index + 1}
                      </span>
                      <p className="break-words font-semibold text-gray-900">
                        {item.debtName}
                      </p>
                    </div>
                    <p className="break-words text-sm text-gray-500">
                      {item.institution}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{item.summary}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      <span>
                        Kalan borç: {formatCurrency(item.remainingDebt, currencyCode)}
                      </span>
                      <span>
                        Min. ödeme: {formatCurrency(item.minimumPayment, currencyCode)}
                      </span>
                      <span>
                        Son ödeme günü: {item.dueDay ?? "-"}
                      </span>
                    </div>
                  </div>

                  <div className="flex max-w-xs flex-wrap justify-end gap-2">
                    {item.reasons.map((reason) => (
                      <span
                        key={reason}
                        className="finance-badge finance-badge-warn"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
