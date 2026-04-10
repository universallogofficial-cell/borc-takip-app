import { formatCurrency } from "@/lib/formatCurrency";
import type { ClosedDebtItem, CurrencyCode } from "@/types/finance";

type ClosedDebtsProps = {
  debts: ClosedDebtItem[];
  currencyCode: CurrencyCode;
  onEditDebt: (id: number) => void;
  onDeleteDebt: (id: number) => void;
};

export default function ClosedDebts({
  debts,
  currencyCode,
  onEditDebt,
  onDeleteDebt,
}: ClosedDebtsProps) {
  return (
    <section className="finance-panel p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="finance-kicker">Arşiv</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">
            Kapanan Borç Arşivi
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Kalan borcu kapanmış kayıtlar burada tutulur.
          </p>
        </div>
        <div className="finance-badge finance-badge-neutral">
          {debts.length} kayıt
        </div>
      </div>

      {debts.length === 0 ? (
        <div className="finance-empty p-4 text-sm text-slate-500">
          Kapanan borç arşivinde kayıt yok.
        </div>
      ) : (
        <div className="space-y-3">
          {debts.map((item) => (
            <div
              key={item.id}
              className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="break-words font-medium text-gray-900">
                    {item.name}
                  </p>
                  <p className="break-words text-sm text-gray-500">
                    {item.institution}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>Ürün tipi: {item.productType}</span>
                    <span>Kalan borç: {formatCurrency(item.remainingDebt, currencyCode)}</span>
                    <span className="finance-badge finance-badge-good">
                      Kapanmış
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onEditDebt(item.id)}
                    className="finance-button-ghost rounded-xl px-3 py-2"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteDebt(item.id)}
                    className="finance-button-danger rounded-xl px-3 py-2"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
