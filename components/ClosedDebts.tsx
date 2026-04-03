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
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Kapanan Borç Arşivi
          </h3>
          <p className="text-sm text-gray-500">
            Kalan borcu kapanmış kayıtlar burada tutulur.
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
          {debts.length} kayıt
        </div>
      </div>

      {debts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
          Kapanan borç arşivinde kayıt yok.
        </div>
      ) : (
        <div className="space-y-3">
          {debts.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 p-4"
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
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      Kapanmış
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onEditDebt(item.id)}
                    className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteDebt(item.id)}
                    className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
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
