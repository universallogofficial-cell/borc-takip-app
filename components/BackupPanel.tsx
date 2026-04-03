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
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Yedekleme ve Geri Yükleme
        </h3>
        <p className="text-sm text-gray-500">
          JSON dışa aktarma mevcut kullanıcı verisini indirir. İçe aktarma,
          önizleme ve onay ile güvenli ekleme modunda çalışır.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onExport}
          disabled={isImporting}
          className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          JSON Yedek İndir
        </button>

        <label
          className={`w-full rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition sm:w-auto ${
            isImporting
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-gray-100"
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

      {preview && (
        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="font-medium text-gray-900">{preview.fileName}</p>
          <div className="mt-2 grid gap-2 text-sm text-gray-600 sm:grid-cols-2 xl:grid-cols-4">
            <p>Sürüm: {preview.version}</p>
            <p>Tarih: {formatDateTime(preview.exportedAt)}</p>
            <p>Borç: {preview.debtCount}</p>
            <p>Kasa: {preview.cashCount}</p>
            <p>Ödeme: {preview.paymentCount}</p>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={onConfirmImport}
              disabled={isImporting}
              className="w-full rounded-xl bg-gray-900 px-4 py-2 text-sm text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isImporting ? "İçe Aktarılıyor..." : "Önizlemeyi Onayla ve İçe Aktar"}
            </button>
            <button
              type="button"
              onClick={onClearPreview}
              disabled={isImporting}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
