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
  const leadRecommendation = scenario.recommendations[0] ?? null;

  return (
    <section className="finance-panel p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="finance-kicker">
            Borç Kapatma Stratejisi
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            Öncelikli borcu netleştirin
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Seçilen stratejiye göre önce hangi borcu düşünmeniz gerektiğini görün.
            Bu alan yalnızca karar desteği sunar, otomatik ödeme işlemi başlatmaz.
          </p>
        </div>
        <span className="finance-badge finance-badge-neutral">
          {scenario.strategyTag}
        </span>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="finance-surface-muted rounded-[24px] p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Strateji
              </label>
              <select
                value={strategy}
                onChange={(e) => onStrategyChange(e.target.value as PayoffStrategy)}
                className="finance-field"
              >
                {payoffStrategyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Ek Ödeme Bütçesi
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={extraBudget}
                onChange={(e) => onExtraBudgetChange(e.target.value)}
                placeholder="Örn: 1000"
                className="finance-field"
              />
            </div>
          </div>

          {validationError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {validationError}
            </div>
          )}

            <div className="mt-4 rounded-[22px] bg-white p-4 ring-1 ring-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Plan Yorumu
            </p>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {scenario.strategyLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {scenario.summaryNote}
            </p>
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 text-white shadow-[0_28px_60px_rgba(15,23,42,0.18)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
            Önce Değerlendirin
          </p>
          {leadRecommendation ? (
            <>
              <p className="mt-3 text-lg font-semibold">{leadRecommendation.debtName}</p>
              <p className="mt-1 text-sm text-slate-300">{leadRecommendation.institution}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">Kalan Borç</p>
                  <p className="mt-1 text-base font-semibold">
                    {formatCurrency(leadRecommendation.remainingDebt, currencyCode)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">Önerilen Ek</p>
                  <p className="mt-1 text-base font-semibold">
                    {formatCurrency(leadRecommendation.suggestedExtraPayment, currencyCode)}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-200">
                {leadRecommendation.reason}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {leadRecommendation.drivers.map((driver) => (
                  <span
                    key={driver}
                    className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-100 ring-1 ring-white/10"
                  >
                    {driver}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-300">
              Aktif borç oluştuğunda en baskılı kayıt burada öne çıkar.
            </p>
          )}
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="finance-stat-card transition hover:-translate-y-0.5 hover:shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Strateji</p>
          <p className="mt-2 font-semibold text-gray-900">{scenario.strategyLabel}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Aktif Borç</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{scenario.activeDebtCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Minimum Yük</p>
          <p className="mt-2 font-semibold text-gray-900">
            {formatCurrency(scenario.minimumPaymentLoad, currencyCode)}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Plan İhtiyacı</p>
          <p className="mt-2 font-semibold text-gray-900">
            {formatCurrency(scenario.totalRequiredCash, currencyCode)}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Uygulanabilirlik</p>
          <p
            className={`mt-2 font-semibold ${
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

      <div className="finance-surface-muted mb-5 rounded-[24px] p-4 text-sm text-slate-600">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Mevcut Nakit
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              {formatCurrency(scenario.currentCash, currencyCode)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Ek Bütçe
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              {formatCurrency(scenario.extraBudget, currencyCode)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Minimumler Sonrası
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              {formatCurrency(scenario.availableAfterMinimums, currencyCode)}
            </p>
          </div>
        </div>
      </div>

      {scenario.recommendations.length === 0 ? (
        <div className="finance-empty p-5 text-sm text-slate-500">
          Planlanacak aktif borç kaydı yok.
        </div>
      ) : (
        <div className="space-y-3">
          {scenario.recommendations.map((item, index) => (
            <div
              key={item.id}
                className="rounded-[24px] border border-slate-200/80 bg-white/92 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white">
                      #{index + 1}
                    </span>
                    <p className="break-words font-semibold text-gray-900">
                      {item.debtName}
                    </p>
                  </div>
                  <p className="mt-1 break-words text-sm text-gray-500">
                    {item.institution}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                    <span>Kalan: {formatCurrency(item.remainingDebt, currencyCode)}</span>
                    <span>Min: {formatCurrency(item.minimumPayment, currencyCode)}</span>
                    <span>Faiz: %{item.rate || 0}</span>
                    <span>Vade: {item.dueDay ?? "-"}</span>
                  </div>
                  <p className="mt-3 break-words text-sm leading-6 text-gray-600">
                    {item.reason}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.drivers.map((driver) => (
                      <span
                        key={driver}
                        className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800"
                      >
                        {driver}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="min-w-40 rounded-2xl bg-gray-50 p-4 text-left sm:text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Önerilen Ek Ödeme
                  </p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
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
