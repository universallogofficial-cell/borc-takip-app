import type { DebtTab } from "@/types/finance";

type TabsProps = {
  selectedTab: DebtTab;
  onChangeTab: (tab: DebtTab) => void;
};

export default function Tabs({ selectedTab, onChangeTab }: TabsProps) {
  const tabButtonClass = (tab: DebtTab) =>
    selectedTab === tab
      ? "rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      : "rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50";

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={tabButtonClass("all")} onClick={() => onChangeTab("all")}>
        Tümü
      </button>

      <button
        type="button"
        className={tabButtonClass("credit_card")}
        onClick={() => onChangeTab("credit_card")}
      >
        Kredi Kartı
      </button>

      <button type="button" className={tabButtonClass("loan")} onClick={() => onChangeTab("loan")}>
        Kredi
      </button>

      <button type="button" className={tabButtonClass("other")} onClick={() => onChangeTab("other")}>
        Diğer
      </button>
    </div>
  );
}
