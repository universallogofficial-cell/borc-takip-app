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
    <div className="finance-panel p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="finance-kicker">Ödeme Geçmişi</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Finansal hareketler</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Filtre, arama ve tutar görünümü ile ödeme akışını okunur biçimde izle.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={onExportPayments}
            disabled={!hasAnyPayments}
            className="finance-button-ghost rounded-xl px-3 py-2"
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
                  ? "bg-slate-950 text-white shadow-[0_14px_28px_rgba(15,23,42,0.14)]"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="finance-stat-card">
          <p className="text-sm text-slate-500">Toplam Ödeme</p>
          <p className="font-semibold text-slate-950">{totalPaymentCount}</p>
        </div>
        <div className="finance-stat-card">
          <p className="text-sm text-slate-500">Toplam Tutar</p>
          <p className="font-semibold text-slate-950">
            {formatCurrency(totalPaymentAmount, currencyCode)}
          </p>
        </div>
        <div className="finance-stat-card">
          <p className="text-sm text-slate-500">Filtrede Görünen</p>
          <p className="font-semibold text-slate-950">{filteredPaymentCount}</p>
        </div>
        <div className="finance-stat-card">
          <p className="text-sm text-slate-500">Filtre Tutarı</p>
          <p className="font-semibold text-slate-950">
            {formatCurrency(filteredPaymentAmount, currencyCode)}
          </p>
        </div>
        <div className="finance-stat-card">
          <p className="text-sm text-slate-500">Son 30 Gün</p>
          <p className="font-semibold text-slate-950">
            {formatCurrency(last30DaysPaymentAmount, currencyCode)}
          </p>
        </div>
      </div>

      <div className="finance-surface-muted mb-4 rounded-[24px] p-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-slate-900">Filtreler</p>
          <p className="text-sm text-slate-500">
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
                  ? "bg-slate-950 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Arama
            </label>
            <input
              type="text"
              value={paymentSearch}
              onChange={(e) => onChangePaymentSearch(e.target.value)}
              placeholder="Borç, kasa veya not ara"
              className="finance-field py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Minimum tutar
            </label>
            <input
              type="number"
              step="0.01"
              value={paymentMinAmount}
              onChange={(e) => onChangePaymentMinAmount(e.target.value)}
              placeholder="Örn: 500"
              className="finance-field py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Maksimum tutar
            </label>
            <input
              type="number"
              step="0.01"
              value={paymentMaxAmount}
              onChange={(e) => onChangePaymentMaxAmount(e.target.value)}
              placeholder="Örn: 5000"
              className="finance-field py-2"
            />
          </div>
        </div>
      </div>

      {loadingPayments ? (
        <div className="finance-surface-muted rounded-[24px] p-4">
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-900">
              Ödeme kayıtları hazırlanıyor
            </p>
            <p className="text-sm text-slate-500">
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
        <div className="finance-empty p-6 text-center">
          <p className="text-sm font-medium text-slate-900">
            {hasAnyPayments
              ? "Seçili filtreler için ödeme kaydı yok."
              : "Henüz ödeme kaydı bulunmuyor."}
          </p>
          <p className="mt-2 text-sm text-slate-500">
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
                className="finance-button-ghost"
              >
                Filtreleri Temizle
              </button>
            )}
            <Link
              href="/app/payments"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="finance-button-secondary"
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
              className="rounded-[24px] border border-slate-200/80 bg-white/92 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="break-words font-medium text-slate-950">{payment.debtName}</p>
                  <p className="break-words text-sm text-slate-500">
                    Kasa: {payment.cashName}
                  </p>
                  <p className="text-sm text-slate-500">
                    Tarih: {formatDateTime(payment.createdAt)}
                  </p>
                  <p className="mt-1 break-words text-sm text-slate-500">
                    {payment.note || "Not yok"}
                  </p>
                </div>

                <div className="shrink-0 text-left sm:text-right">
                  <p className="font-semibold text-slate-950">
                    {formatCurrency(payment.amount, currencyCode)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => onEditPayment(payment.id)}
                      className={`rounded-xl px-3 py-2 text-sm text-white transition ${
                        editingPaymentId === payment.id
                          ? "bg-slate-950"
                          : "bg-slate-900 hover:bg-slate-800"
                      }`}
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePayment(payment.id)}
                      disabled={deletingPaymentId === payment.id}
                      className="finance-button-danger rounded-xl px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="finance-button-ghost"
          >
            Daha Fazla Göster
          </button>
        </div>
      )}
    </div>
  );
}
