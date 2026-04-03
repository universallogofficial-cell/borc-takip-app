import type { CashItem, CurrencyCode } from "@/types/finance";
import { formatCurrency } from "@/lib/formatCurrency";

type CashPanelProps = {
  currentCash: number;
  cashList: CashItem[];
  currencyCode: CurrencyCode;
  cashSearch: string;
  onCashSearchChange: (value: string) => void;
  onExportCash: () => void;
  onEditCash: (item: CashItem) => void;
};

export default function CashPanel({
  currentCash,
  cashList,
  currencyCode,
  cashSearch,
  onCashSearchChange,
  onExportCash,
  onEditCash,
}: CashPanelProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Nakit Alanı</h3>
          <p className="text-sm text-gray-500">
            Kasa bakiyelerini arayın, dışa aktarın ve düzenleyin.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <input
            type="text"
            value={cashSearch}
            onChange={(e) => onCashSearchChange(e.target.value)}
            placeholder="Kasa ara"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 sm:min-w-56"
          />
          <button
            type="button"
            onClick={onExportCash}
            disabled={cashList.length === 0}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            CSV Dışa Aktar
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-2xl bg-gray-50 p-4">
        <p className="text-sm text-gray-500">Toplam Nakit</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">
          {formatCurrency(currentCash, currencyCode)}
        </p>
      </div>

      <div className="space-y-3">
        {cashList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            {cashSearch.trim()
              ? "Aramanıza uygun kasa kaydı yok."
              : "Henüz kasa kaydı bulunmuyor."}
          </div>
        ) : (
          cashList.map((cash) => (
            <div
              key={cash.id}
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="break-words font-medium text-gray-900">{cash.name}</p>
                  <p className="break-words text-sm text-gray-500">
                    {cash.note || "Not yok"}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-500">Bakiye</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(Number(cash.balance), currencyCode)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onEditCash(cash)}
                    className="mt-2 rounded-lg bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                  >
                    Düzenle
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
