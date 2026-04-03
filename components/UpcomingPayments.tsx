import { formatCurrency } from "@/lib/formatCurrency";
import type {
  CurrencyCode,
  UpcomingPaymentItem,
  UpcomingPaymentStatus,
  UpcomingPaymentSummary,
} from "@/types/finance";

type UpcomingPaymentsProps = {
  items: UpcomingPaymentItem[];
  summary: UpcomingPaymentSummary;
  currencyCode: CurrencyCode;
};

const statusConfig: Record<
  UpcomingPaymentStatus,
  { label: string; className: string }
> = {
  today: {
    label: "Bugün",
    className: "bg-amber-100 text-amber-800",
  },
  approaching: {
    label: "Yaklaşıyor",
    className: "bg-sky-100 text-sky-800",
  },
  passed: {
    label: "Geçti",
    className: "bg-red-100 text-red-700",
  },
  later_this_month: {
    label: "Bu Ay Sonra",
    className: "bg-gray-100 text-gray-700",
  },
};

export default function UpcomingPayments({
  items,
  summary,
  currencyCode,
}: UpcomingPaymentsProps) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Yaklaşan Ödemeler
          </h3>
          <p className="text-sm text-gray-500">
            Vadesi olan aktif borçları aylık görünümde izleyin.
          </p>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Bu Ay Vadesi Olan</p>
          <p className="font-semibold text-gray-900">
            {summary.dueThisMonthCount}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Toplam Minimum Ödeme</p>
          <p className="font-semibold text-gray-900">
            {formatCurrency(summary.totalMinimumPayment, currencyCode)}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Bugün / Yakın Kayıt</p>
          <p className="font-semibold text-gray-900">{summary.urgentCount}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
          Henüz yaklaşan ödeme kaydı bulunmuyor.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const status = statusConfig[item.status];

            return (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium text-gray-900">
                      {item.debtName}
                    </p>
                    <p className="break-words text-sm text-gray-500">
                      {item.institution}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      <span>Son ödeme günü: {item.dueDay}</span>
                      <span>
                        Minimum ödeme: {formatCurrency(item.minimumPayment, currencyCode)}
                      </span>
                      <span>
                        Kalan borç: {formatCurrency(item.remainingDebt, currencyCode)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
