import { formatCurrency } from "@/lib/formatCurrency";
import { payoffStrategyOptions } from "@/lib/payoffPlanner";
import type {
  CurrencyCode,
  PayoffScenario,
  PayoffStrategy,
} from "@/types/finance";

type PayoffPlannerProps = {
  strategy: PayoffStrategy;
  extraBudget: string;
  onStrategyChange: (value: PayoffStrategy) => void;
  onExtraBudgetChange: (value: string) => void;
  scenario: PayoffScenario;
  validationError: string | null;
  currencyCode: CurrencyCode;
};

export default function PayoffPlanner({
  strategy,
  extraBudget,
  onStrategyChange,
  onExtraBudgetChange,
  scenario,
  validationError,
  currencyCode,
}: PayoffPlannerProps) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Ödeme Stratejisi / Planlama
          </h3>
          <p className="text-sm text-gray-500">
            Bu alan yalnızca öneri üretir, otomatik ödeme işlemi başlatmaz.
          </p>
        </div>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
          {scenario.strategyTag}
        </span>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-gray-600">Strateji</label>
          <select
            value={strategy}
            onChange={(e) => onStrategyChange(e.target.value as PayoffStrategy)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          >
            {payoffStrategyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">
            Ek Ödeme Bütçesi
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={extraBudget}
            onChange={(e) => onExtraBudgetChange(e.target.value)}
            placeholder="Örn: 1000"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          />
        </div>
      </div>

      {validationError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {validationError}
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Strateji</p>
          <p className="font-semibold text-gray-900">{scenario.strategyLabel}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Aktif Borç</p>
          <p className="font-semibold text-gray-900">{scenario.activeDebtCount}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Minimum Yük</p>
            <p className="font-semibold text-gray-900">
            {formatCurrency(scenario.minimumPaymentLoad, currencyCode)}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Toplam Plan İhtiyacı</p>
            <p className="font-semibold text-gray-900">
            {formatCurrency(scenario.totalRequiredCash, currencyCode)}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Uygulanabilirlik</p>
          <p
            className={`font-semibold ${
              scenario.canCoverPlan
                ? "text-emerald-700"
                : scenario.canCoverMinimums
                  ? "text-amber-700"
                  : "text-red-700"
            }`}
          >
            {scenario.feasibilityLabel}
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
        <p>Mevcut nakit: {formatCurrency(scenario.currentCash, currencyCode)}</p>
        <p>Ek ödeme bütçesi: {formatCurrency(scenario.extraBudget, currencyCode)}</p>
        <p>
          Minimum ödemeler sonrası kalan nakit:{" "}
          {formatCurrency(scenario.availableAfterMinimums, currencyCode)}
        </p>
        <p className="mt-2">{scenario.summaryNote}</p>
      </div>

      {scenario.recommendations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
          Planlanacak aktif borç kaydı yok.
        </div>
      ) : (
        <div className="space-y-3">
          {scenario.recommendations.map((item, index) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="break-words font-medium text-gray-900">
                    {index + 1}. {item.debtName}
                  </p>
                  <p className="break-words text-sm text-gray-500">
                    {item.institution}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>Kalan: {formatCurrency(item.remainingDebt, currencyCode)}</span>
                    <span>Min: {formatCurrency(item.minimumPayment, currencyCode)}</span>
                    <span>Faiz: %{item.rate || 0}</span>
                    <span>Vade: {item.dueDay ?? "-"}</span>
                  </div>
                  <p className="mt-2 break-words text-sm text-gray-600">
                    {item.reason}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-500">Önerilen ek ödeme</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(item.suggestedExtraPayment, currencyCode)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
