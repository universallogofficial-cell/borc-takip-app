import Link from "next/link";
import type { CashItem, CurrencyCode } from "@/types/finance";
import { formatCurrency } from "@/lib/formatCurrency";

type CashPanelProps = {
  currentCash: number;
  cashList: CashItem[];
  currencyCode: CurrencyCode;
  cashSearch: string;
  onCashSearchChange: (value: string) => void;
  onExportCash: () => void;
  onEditCash: (item: CashItem) => void;
  onDeleteCash: (id: number) => void;
};

export default function CashPanel({
  currentCash,
  cashList,
  currencyCode,
  cashSearch,
  onCashSearchChange,
  onExportCash,
  onEditCash,
  onDeleteCash,
}: CashPanelProps) {
  return (
    <div className="finance-panel p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="finance-kicker">Kasalar</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Nakit görünümü</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Kasalarını ara, dışa aktar ve güncel bakiyeyi tek akışta izle.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <div className="w-full sm:min-w-72">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Arama
            </label>
            <input
              type="text"
              value={cashSearch}
              onChange={(e) => onCashSearchChange(e.target.value)}
              placeholder="Kasa adı veya not ara"
              className="finance-field py-2"
            />
          </div>
          <button
            type="button"
            onClick={onExportCash}
            disabled={cashList.length === 0}
            className="finance-button-ghost sm:self-end"
          >
            CSV Dışa Aktar
          </button>
        </div>
      </div>

      <div className="mb-5 rounded-[26px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 text-white shadow-[0_24px_50px_rgba(15,23,42,0.18)]">
        <p className="text-sm text-white/65">Toplam Nakit</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">
          {formatCurrency(currentCash, currencyCode)}
        </p>
        <p className="mt-2 text-sm text-white/75">
          Kasalarındaki kullanılabilir toplam bakiyeyi gösterir.
        </p>
      </div>

      <div className="space-y-3">
        {cashList.length === 0 ? (
          <div className="finance-empty p-6 text-center">
            <p className="text-sm font-medium text-slate-900">
              {cashSearch.trim()
                ? "Aramanıza uygun kasa kaydı yok."
                : "Henüz kasa kaydı bulunmuyor."}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {cashSearch.trim()
                ? "Arama ifadesini temizleyin veya yeni kasa oluşturun."
                : "İlk kasa kaydını oluşturarak ödeme akışını başlatın."}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {cashSearch.trim() && (
                <button
                  type="button"
                  onClick={() => onCashSearchChange("")}
                  className="finance-button-ghost"
                >
                  Aramayı Temizle
                </button>
              )}
              <Link
                href="/app/cash"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="finance-button-secondary"
              >
                Yeni Kasa Ekle
              </Link>
            </div>
          </div>
        ) : (
          cashList.map((cash) => (
            <div
              key={cash.id}
              className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="break-words font-medium text-slate-950">{cash.name}</p>
                  <p className="break-words text-sm text-slate-500">
                    {cash.note || "Not yok"}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-slate-500">Bakiye</p>
                  <p className="font-semibold text-slate-950">
                    {formatCurrency(Number(cash.balance), currencyCode)}
                  </p>
                  <div className="mt-2 flex flex-wrap justify-start gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => onEditCash(cash)}
                      className="finance-button-ghost rounded-xl px-3 py-2"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCash(cash.id)}
                      className="finance-button-danger rounded-xl px-3 py-2"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
