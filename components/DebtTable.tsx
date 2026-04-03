import type { DebtTableItem } from "@/types/finance";

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
  return (
    <div className="xl:col-span-2 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Aktif Borçlar
          </h3>
          <p className="text-sm text-gray-500">
            Açık borç kayıtlarını arayın, düzenleyin ve dışa aktarın.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <input
            type="text"
            value={debtSearch}
            onChange={(e) => onDebtSearchChange(e.target.value)}
            placeholder="Borç ara"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 sm:min-w-56"
          />
          <button
            type="button"
            onClick={onExportDebts}
            disabled={debts.length === 0}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
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
          {debts.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4">
                <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                  {debtSearch.trim()
                    ? "Aramanıza uygun aktif borç kaydı yok."
                    : "Henüz aktif borç kaydı bulunmuyor."}
                </div>
              </td>
            </tr>
          ) : (
            debts.map((item) => (
              <tr key={item.id} className="bg-gray-50">
                <td className="rounded-l-xl px-4 py-4 font-medium break-words">
                  {item.name}
                </td>
                <td className="px-4 py-4 break-words">{item.type}</td>
                <td className="px-4 py-4">{item.amount}</td>
                <td className="px-4 py-4">{item.dueDate}</td>
                <td className="px-4 py-4 break-words">{item.status}</td>
                <td className="rounded-r-xl px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
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
