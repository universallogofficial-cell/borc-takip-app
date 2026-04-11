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
    className: "finance-badge finance-badge-warn",
  },
  approaching: {
    label: "Yaklaşıyor",
    className: "finance-badge finance-badge-neutral",
  },
  passed: {
    label: "Geçti",
    className: "finance-badge finance-badge-danger",
  },
  later_this_month: {
    label: "Bu ay",
    className: "finance-badge finance-badge-good",
  },
};

export default function UpcomingPayments({
  items,
  currencyCode,
}: UpcomingPaymentsProps) {
  return (
    <section className="finance-panel mx-auto w-full max-w-4xl px-5 py-6 md:px-7">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="finance-kicker">Ödeme Akışı</p>
          <h3 className="font-display mt-2 text-3xl tracking-tight text-[#1f2924]">
            Yaklaşan ödemeler
          </h3>
        </div>
        <p className="text-sm text-[#65716a]">{items.length} kayıt</p>
      </div>

      {items.length === 0 ? (
        <div className="finance-empty p-4 text-sm text-[#65716a]">
          Henüz yaklaşan ödeme kaydı bulunmuyor.
        </div>
      ) : (
        <div>
          {items.map((item) => {
            const status = statusConfig[item.status];

            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 border-b border-[rgba(15,61,46,0.08)] py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="break-words text-base font-medium text-[#1f2924]">
                    {item.debtName}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#65716a]">
                    <span>{item.institution}</span>
                    <span>Gün {item.dueDay}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <p className="text-base font-semibold text-[#1f2924]">
                    {formatCurrency(item.minimumPayment, currencyCode)}
                  </p>
                  <span className={status.className}>{status.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
