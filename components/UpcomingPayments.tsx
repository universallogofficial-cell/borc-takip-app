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
  currencyCode,
}: UpcomingPaymentsProps) {
  return (
    <section className="finance-panel p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="finance-kicker">Takvim</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">
            Yaklaşan Ödemeler
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Önündeki ödemeleri sade bir liste görünümünde izle.
          </p>
        </div>
        <span className="finance-badge finance-badge-neutral">{items.length} kayıt</span>
      </div>

      {items.length === 0 ? (
        <div className="finance-empty p-4 text-sm text-slate-500">
          Henüz yaklaşan ödeme kaydı bulunmuyor.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const status = statusConfig[item.status];

            return (
              <div
                key={item.id}
                className="rounded-[24px] border border-slate-200/80 bg-white/92 p-4 shadow-sm"
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
                    className={`finance-badge ${status.className}`}
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
