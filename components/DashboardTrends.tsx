import type { DashboardTrendItem } from "@/types/finance";

type DashboardTrendsProps = {
  items: DashboardTrendItem[];
};

export default function DashboardTrends({ items }: DashboardTrendsProps) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Dashboard Trendleri
        </h3>
        <p className="text-sm text-gray-500">
          Kısa dönem hareketleri tek bakışta izleyin.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="mt-1 font-semibold text-gray-900">{item.value}</p>
            <p className="mt-1 text-sm text-gray-500">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
