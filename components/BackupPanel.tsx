import { formatDateTime } from "@/lib/formatCurrency";
import type { BackupPreview } from "@/types/finance";

type BackupPanelProps = {
  preview: BackupPreview | null;
  isImporting: boolean;
  onExport: () => void;
  onFileSelect: (file: File) => void;
  onConfirmImport: () => void;
  onClearPreview: () => void;
};

export default function BackupPanel({
  preview,
  isImporting,
  onExport,
  onFileSelect,
  onConfirmImport,
  onClearPreview,
}: BackupPanelProps) {
  return (
    <section className="finance-panel p-6">
      <div className="mb-6">
        <p className="finance-kicker">Yedekleme</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">
          Yedekleme ve Geri Yükleme
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          JSON yedekleri mevcut kullanıcı verisini dışa aktarır. İçe aktarma akışı
          önizleme ve onay ile ekleme modunda çalışır; mevcut kayıtları silmez.
        </p>
      </div>

      <div className="space-y-4">
        <div className="finance-surface-muted rounded-[24px] p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-900">Dışa Aktarma</p>
            <p className="mt-1 text-sm text-gray-500">
              Borç, kasa ve ödeme kayıtlarınızı tek bir JSON dosyası olarak
              indirip güvenli şekilde saklayın.
            </p>
          </div>

          <button
            type="button"
            onClick={onExport}
            disabled={isImporting}
            className="finance-button-ghost w-full sm:w-auto"
          >
            JSON Yedek İndir
          </button>
        </div>

        <div className="finance-surface-muted rounded-[24px] p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-900">İçe Aktarma</p>
            <p className="mt-1 text-sm text-gray-500">
              Dosya önce önizlenir. Onay verdiğinizde kayıtlar ekleme modunda
              aktarılır ve mevcut veriler korunur.
            </p>
          </div>

          <div className="finance-empty bg-white p-4">
            <p className="text-sm font-medium text-gray-900">
              JSON dosyanızı seçin
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Desteklenen yapı: borçlar, kasalar ve ödemeler içeren uygulama
              yedeği.
            </p>

            <div className="mt-4">
              <label
                className={`finance-button-ghost w-full sm:w-auto ${
                  isImporting
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                JSON İçe Aktar
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  disabled={isImporting}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onFileSelect(file);
                    }
                    e.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {preview && (
        <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5 ring-1 ring-slate-100">
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-900">
              İçe Aktarma Önizlemesi
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Dosya içeriği kontrol edildi. İsterseniz aktarımı onaylayabilir veya
              önizlemeyi temizleyebilirsiniz.
            </p>
          </div>

          <p className="font-medium text-gray-900">{preview.fileName}</p>
          <div className="mt-3 grid gap-3 text-sm text-gray-600 sm:grid-cols-2 xl:grid-cols-4">
            <div className="finance-stat-card">
              <p className="text-xs uppercase tracking-wide text-gray-500">Sürüm</p>
              <p className="mt-1 font-medium text-gray-900">{preview.version}</p>
            </div>
            <div className="finance-stat-card">
              <p className="text-xs uppercase tracking-wide text-gray-500">Tarih</p>
              <p className="mt-1 font-medium text-gray-900">
                {formatDateTime(preview.exportedAt)}
              </p>
            </div>
            <div className="finance-stat-card">
              <p className="text-xs uppercase tracking-wide text-gray-500">Borç</p>
              <p className="mt-1 font-medium text-gray-900">{preview.debtCount}</p>
            </div>
            <div className="finance-stat-card">
              <p className="text-xs uppercase tracking-wide text-gray-500">Kasa</p>
              <p className="mt-1 font-medium text-gray-900">{preview.cashCount}</p>
            </div>
            <div className="finance-stat-card sm:col-span-2 xl:col-span-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Ödeme</p>
              <p className="mt-1 font-medium text-gray-900">{preview.paymentCount}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={onConfirmImport}
              disabled={isImporting}
              className="finance-button-primary w-full sm:w-auto"
            >
              {isImporting ? "İçe Aktarılıyor..." : "Önizlemeyi Onayla ve İçe Aktar"}
            </button>
            <button
              type="button"
              onClick={onClearPreview}
              disabled={isImporting}
              className="finance-button-ghost w-full sm:w-auto"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
