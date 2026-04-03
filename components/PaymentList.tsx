import { formatCurrency, formatDateTime } from "@/lib/formatCurrency";
import type { CurrencyCode, PaymentFilter, PaymentListRow } from "@/types/finance";

type PaymentListProps = {
  payments: PaymentListRow[];
  loadingPayments: boolean;
  deletingPaymentId: number | null;
  editingPaymentId: number | null;
  currencyCode: CurrencyCode;
  selectedFilter: PaymentFilter;
  paymentSearch: string;
  paymentMinAmount: string;
  paymentMaxAmount: string;
  onChangeFilter: (filter: PaymentFilter) => void;
  onChangePaymentSearch: (value: string) => void;
  onChangePaymentMinAmount: (value: string) => void;
  onChangePaymentMaxAmount: (value: string) => void;
  onEditPayment: (paymentId: number) => void;
  onDeletePayment: (paymentId: number) => void;
  onExportPayments: () => void;
  hasAnyPayments: boolean;
  totalPaymentCount: number;
  filteredPaymentCount: number;
  totalPaymentAmount: number;
  filteredPaymentAmount: number;
  last30DaysPaymentAmount: number;
  hasMorePayments: boolean;
  onLoadMore: () => void;
};

const paymentFilters: Array<{ label: string; value: PaymentFilter }> = [
  { label: "Tümü", value: "all" },
  { label: "Bugün", value: "today" },
  { label: "Son 7 Gün", value: "last_7_days" },
  { label: "Bu Ay", value: "this_month" },
];

export default function PaymentList({
  payments,
  loadingPayments,
  deletingPaymentId,
  editingPaymentId,
  currencyCode,
  selectedFilter,
  paymentSearch,
  paymentMinAmount,
  paymentMaxAmount,
  onChangeFilter,
  onChangePaymentSearch,
  onChangePaymentMinAmount,
  onChangePaymentMaxAmount,
  onEditPayment,
  onDeletePayment,
  onExportPayments,
  hasAnyPayments,
  totalPaymentCount,
  filteredPaymentCount,
  totalPaymentAmount,
  filteredPaymentAmount,
  last30DaysPaymentAmount,
  hasMorePayments,
  onLoadMore,
}: PaymentListProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ödeme Geçmişi</h3>
          <p className="text-sm text-gray-500">
            Filtre, arama ve dışa aktarma ile ödeme kayıtlarını izleyin.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={onExportPayments}
            disabled={!hasAnyPayments}
            className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            CSV Dışa Aktar
          </button>
          {paymentFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => onChangeFilter(filter.value)}
              className={`rounded-lg px-3 py-1 text-sm transition ${
                selectedFilter === filter.value
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Toplam Ödeme</p>
          <p className="font-semibold text-gray-900">{totalPaymentCount}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Toplam Tutar</p>
          <p className="font-semibold text-gray-900">
            {formatCurrency(totalPaymentAmount, currencyCode)}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Filtrede Görünen</p>
          <p className="font-semibold text-gray-900">{filteredPaymentCount}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Filtre Tutarı</p>
          <p className="font-semibold text-gray-900">
            {formatCurrency(filteredPaymentAmount, currencyCode)}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Son 30 Gün</p>
          <p className="font-semibold text-gray-900">
            {formatCurrency(last30DaysPaymentAmount, currencyCode)}
          </p>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input
          type="text"
          value={paymentSearch}
          onChange={(e) => onChangePaymentSearch(e.target.value)}
          placeholder="Borç, kasa veya not ara"
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        <input
          type="number"
          step="0.01"
          value={paymentMinAmount}
          onChange={(e) => onChangePaymentMinAmount(e.target.value)}
          placeholder="Min tutar"
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        <input
          type="number"
          step="0.01"
          value={paymentMaxAmount}
          onChange={(e) => onChangePaymentMaxAmount(e.target.value)}
          placeholder="Max tutar"
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
      </div>

      {loadingPayments ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
          Ödeme verisi yükleniyor...
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
          {hasAnyPayments
            ? "Seçili filtreler için ödeme kaydı yok."
            : "Henüz ödeme kaydı bulunmuyor."}
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="break-words font-medium text-gray-900">{payment.debtName}</p>
                  <p className="break-words text-sm text-gray-500">
                    Kasa: {payment.cashName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Tarih: {formatDateTime(payment.createdAt)}
                  </p>
                  <p className="mt-1 break-words text-sm text-gray-500">
                    {payment.note || "Not yok"}
                  </p>
                </div>

                <div className="shrink-0 text-left sm:text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(payment.amount, currencyCode)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => onEditPayment(payment.id)}
                      className={`rounded-lg px-3 py-1 text-sm text-white transition ${
                        editingPaymentId === payment.id
                          ? "bg-sky-700"
                          : "bg-sky-600 hover:bg-sky-700"
                      }`}
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePayment(payment.id)}
                      disabled={deletingPaymentId === payment.id}
                      className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingPaymentId === payment.id ? "Siliniyor..." : "Sil"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loadingPayments && hasMorePayments && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
          >
            Daha Fazla Göster
          </button>
        </div>
      )}
    </div>
  );
}
