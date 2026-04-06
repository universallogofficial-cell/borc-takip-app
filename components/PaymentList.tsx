import Link from "next/link";
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

      <div className="mb-4 rounded-2xl bg-gray-50 p-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900">Filtreler</p>
          <p className="text-sm text-gray-500">
            Tarih, metin ve tutar aralığı ile ödeme listesini daraltın.
          </p>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {paymentFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => onChangeFilter(filter.value)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                selectedFilter === filter.value
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Arama
            </label>
            <input
              type="text"
              value={paymentSearch}
              onChange={(e) => onChangePaymentSearch(e.target.value)}
              placeholder="Borç, kasa veya not ara"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Minimum tutar
            </label>
            <input
              type="number"
              step="0.01"
              value={paymentMinAmount}
              onChange={(e) => onChangePaymentMinAmount(e.target.value)}
              placeholder="Örn: 500"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Maksimum tutar
            </label>
            <input
              type="number"
              step="0.01"
              value={paymentMaxAmount}
              onChange={(e) => onChangePaymentMaxAmount(e.target.value)}
              placeholder="Örn: 5000"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>
        </div>
      </div>

      {loadingPayments ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900">
              Ödeme kayıtları hazırlanıyor
            </p>
            <p className="text-sm text-gray-500">
              Filtreler ve son hareketler yükleniyor. Liste kısa süre içinde görünecek.
            </p>
          </div>
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
          </div>
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center">
          <p className="text-sm font-medium text-gray-900">
            {hasAnyPayments
              ? "Seçili filtreler için ödeme kaydı yok."
              : "Henüz ödeme kaydı bulunmuyor."}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {hasAnyPayments
              ? "Filtreleri sadeleştirin veya yeni ödeme kaydı oluşturun."
              : "İlk ödeme kaydını ekleyerek hareket geçmişini oluşturmaya başlayın."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {hasAnyPayments && (
              <button
                type="button"
                onClick={() => {
                  onChangeFilter("all");
                  onChangePaymentSearch("");
                  onChangePaymentMinAmount("");
                  onChangePaymentMaxAmount("");
                }}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
              >
                Filtreleri Temizle
              </button>
            )}
            <Link
              href="/payments"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Yeni Ödeme Yap
            </Link>
          </div>
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
