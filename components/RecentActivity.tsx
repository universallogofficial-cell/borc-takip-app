import { formatCurrency, formatDateTime } from "@/lib/formatCurrency";
import type { CurrencyCode, RecentActivityItem } from "@/types/finance";

type RecentActivityProps = {
  activities: RecentActivityItem[];
  currencyCode: CurrencyCode;
};

export default function RecentActivity({
  activities,
  currencyCode,
}: RecentActivityProps) {
  return (
    <section className="finance-panel p-5 md:p-6">
      <div className="mb-4">
        <p className="finance-kicker">
          Son Hareketler
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">Aktivite akışı</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Son işlemler ürün diliyle özetlenmiş bir hareket akışı olarak görünür.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="finance-empty p-4 text-sm text-slate-500">
          İlk işlem yapıldığında hareket özeti burada görünür.
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-[24px] border border-slate-200/80 bg-white/92 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">
                    {activity.actionLabel}
                  </p>
                  <p className="mt-1 break-words text-sm text-gray-600">
                    {activity.title}
                  </p>
                  <p className="mt-1 break-words text-sm leading-6 text-gray-500">
                    {activity.description}
                  </p>
                </div>
                <div className="shrink-0 rounded-[20px] bg-slate-50 p-3 text-left sm:text-right">
                  {activity.amount !== null && (
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(activity.amount, currencyCode)}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDateTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
