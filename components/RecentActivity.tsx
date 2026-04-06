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
    <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-200 md:p-6">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
          Son Hareketler
        </p>
        <h3 className="mt-2 text-xl font-semibold text-gray-900">Aktivite Geçmişi</h3>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Son işlemleriniz burada anlamlı bir operasyon geçmişi olarak görünür.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
          İlk işlem yapıldığında hareket özeti burada görünür.
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-2xl border border-gray-200 p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
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
                <div className="shrink-0 rounded-2xl bg-gray-50 p-3 text-left sm:text-right">
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
