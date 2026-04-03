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
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Risk ve Öncelik
        </h3>
        <p className="text-sm text-gray-500">
          Nakit riski, ödeme önceliği ve aylık performans tek alanda izlenir.
        </p>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Yakın Dönem Yükümlülük</p>
            <p className="mt-1 font-semibold text-gray-900">
            {formatCurrency(cashRisk.nearTermObligation, currencyCode)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Mevcut nakit: {formatCurrency(cashRisk.currentCash, currencyCode)}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Nakit Durumu</p>
          <p
            className={`mt-1 font-semibold ${
              cashRisk.isInsufficient ? "text-red-600" : "text-emerald-700"
            }`}
          >
            {cashRisk.isInsufficient
              ? `${formatCurrency(Math.abs(cashRisk.gap), currencyCode)} eksik`
              : `${formatCurrency(cashRisk.gap, currencyCode)} tampon`}
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

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Aylık Performans</p>
          <div className="mt-1 space-y-1 text-sm text-gray-700">
            <p>Bu ay ödeme: {formatCurrency(performance.thisMonthPaymentTotal, currencyCode)}</p>
            <p>Son 30 gün: {formatCurrency(performance.last30DaysPaymentTotal, currencyCode)}</p>
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
          <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Önceliklendirilecek aktif borç kaydı yok.
          </div>
        ) : (
          <div className="space-y-3">
            {priorities.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium text-gray-900">
                      {item.debtName}
                    </p>
                    <p className="break-words text-sm text-gray-500">
                      {item.institution}
                    </p>
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
                        className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800"
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
