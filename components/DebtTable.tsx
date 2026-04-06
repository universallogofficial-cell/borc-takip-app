import Link from "next/link";
import { useMemo, useState } from "react";
import type { DebtTableItem } from "@/types/finance";

type DebtSortOption = "due_asc" | "amount_desc" | "name_asc";

type Props = {
  debts: DebtTableItem[];
  debtSearch: string;
  onDebtSearchChange: (value: string) => void;
  onExportDebts: () => void;
  onEdit: (item: DebtTableItem) => void;
  onDelete: (id: number) => void;
};

export default function DebtTable({
  debts,
  debtSearch,
  onDebtSearchChange,
  onExportDebts,
  onEdit,
  onDelete,
}: Props) {
  const [sortOption, setSortOption] = useState<DebtSortOption>("due_asc");

  const sortedDebts = useMemo(() => {
    const items = [...debts];

    if (sortOption === "name_asc") {
      return items.sort((a, b) => a.name.localeCompare(b.name, "tr"));
    }

    if (sortOption === "amount_desc") {
      return items.sort((a, b) => Number(b.rawAmount) - Number(a.rawAmount));
    }

    return items.sort((a, b) => {
      const dueA = Number.parseInt(a.dueDate, 10);
      const dueB = Number.parseInt(b.dueDate, 10);

      if (Number.isNaN(dueA) && Number.isNaN(dueB)) {
        return a.name.localeCompare(b.name, "tr");
      }

      if (Number.isNaN(dueA)) {
        return 1;
      }

      if (Number.isNaN(dueB)) {
        return -1;
      }

      return dueA - dueB;
    });
  }, [debts, sortOption]);

  return (
    <div className="xl:col-span-2 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-200 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            Aktif Portföy
          </p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900">
            Aktif Borçlar
          </h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Açık borç kayıtlarını arayın, düzenleyin ve dışa aktarın.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <div className="w-full sm:min-w-72">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Arama
            </label>
            <input
              type="text"
              value={debtSearch}
              onChange={(e) => onDebtSearchChange(e.target.value)}
              placeholder="Borç adı veya kurum ara"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500"
            />
          </div>
          <div className="w-full sm:min-w-48">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Sıralama
            </label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as DebtSortOption)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-500"
            >
              <option value="due_asc">Vade günü yakın</option>
              <option value="amount_desc">Tutar yüksekten düşüğe</option>
              <option value="name_asc">Ada göre A-Z</option>
            </select>
          </div>
          <button
            type="button"
            onClick={onExportDebts}
            disabled={debts.length === 0}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:self-end"
          >
            CSV Dışa Aktar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
      <table className="min-w-[720px] border-separate border-spacing-y-3">
        <thead>
          <tr className="text-left text-sm text-gray-500">
            <th className="pb-2">Kişi</th>
            <th className="pb-2">Tür</th>
            <th className="pb-2">Tutar</th>
            <th className="pb-2">Vade</th>
            <th className="pb-2">Durum</th>
            <th className="pb-2">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {sortedDebts.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4">
                <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {debtSearch.trim()
                      ? "Aramanıza uygun aktif borç kaydı yok."
                      : "Henüz aktif borç kaydı bulunmuyor."}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {debtSearch.trim()
                      ? "Arama ifadesini temizleyin veya yeni borç kaydı ekleyin."
                      : "İlk borç kaydını oluşturarak takip ekranını doldurun."}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    {debtSearch.trim() && (
                      <button
                        type="button"
                        onClick={() => onDebtSearchChange("")}
                        className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                      >
                        Aramayı Temizle
                      </button>
                    )}
                    <Link
                      href="/debts"
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                      Yeni Borç Ekle
                    </Link>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            sortedDebts.map((item) => (
              <tr key={item.id} className="bg-gray-50 transition hover:bg-gray-100/70">
                <td className="rounded-l-2xl px-4 py-4">
                  <div className="space-y-1">
                    <p className="break-words font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Öncelik görünümü
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4 break-words">{item.type}</td>
                <td className="px-4 py-4 font-medium text-gray-900">{item.amount}</td>
                <td className="px-4 py-4">{item.dueDate}</td>
                <td className="px-4 py-4 break-words">{item.status}</td>
                <td className="rounded-r-2xl px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.99]"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600 active:scale-[0.99]"
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
