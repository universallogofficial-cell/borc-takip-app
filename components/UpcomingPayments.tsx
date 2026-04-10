import { formatCurrency } from "@/lib/formatCurrency";
import type {
  CurrencyCode,
  UpcomingPaymentItem,
  UpcomingPaymentStatus,
} from "@/types/finance";

type UpcomingPaymentsProps = {
  items: UpcomingPaymentItem[];
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
    <section className="mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <p className="finance-kicker">Yaklaşan Ödemeler</p>
      </div>

      {items.length === 0 ? (
        <div className="finance-empty p-4 text-sm text-slate-500">
          Henüz yaklaşan ödeme kaydı bulunmuyor.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const status = statusConfig[item.status];

            return (
              <div
                key={item.id}
                className="finance-surface flex flex-col gap-3 rounded-[24px] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="break-words text-base font-medium text-slate-950">
                    {item.debtName}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
                    <span>{item.institution}</span>
                    <span>Gün {item.dueDay}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <p className="text-base font-semibold text-slate-950">
                    {formatCurrency(item.minimumPayment, currencyCode)}
                  </p>
                  <span className={`finance-badge ${status.className}`}>
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
