import type { DebtTab } from "@/types/finance";

type TabsProps = {
  selectedTab: DebtTab;
  onChangeTab: (tab: DebtTab) => void;
};

export default function Tabs({ selectedTab, onChangeTab }: TabsProps) {
  const tabButtonClass = (tab: DebtTab) =>
    selectedTab === tab
      ? "rounded-[18px] bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-[0_16px_28px_rgba(15,23,42,0.14)]"
      : "rounded-[18px] bg-white/92 px-4 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200/80 hover:bg-white hover:text-slate-950";

  return (
    <div className="flex flex-wrap gap-2 rounded-[24px] bg-slate-100/70 p-2">
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
