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
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">İşlem Geçmişi</h3>
        <p className="text-sm text-gray-500">
          Son önemli hareketler operasyonel özet olarak gösterilir.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
          Görüntülenecek işlem geçmişi yok.
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">
                    {activity.actionLabel}
                  </p>
                  <p className="break-words text-sm text-gray-600">
                    {activity.title}
                  </p>
                  <p className="break-words text-sm text-gray-500">
                    {activity.description}
                  </p>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  {activity.amount !== null && (
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(activity.amount, currencyCode)}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
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
