import { getCurrencyLabel } from "@/lib/formatCurrency";
import type { AppSettings, CurrencyCode } from "@/types/finance";

type SettingsPanelProps = {
  settings: AppSettings;
  onCurrencyChange: (currencyCode: CurrencyCode) => void;
  onToggleConfirmations: (enabled: boolean) => void;
};

const currencyOptions: CurrencyCode[] = ["TRY", "USD", "EUR"];

export default function SettingsPanel({
  settings,
  onCurrencyChange,
  onToggleConfirmations,
}: SettingsPanelProps) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Ayarlar</h3>
        <p className="text-sm text-gray-500">
          Görüntüleme tercihleri ve kritik işlem korumaları tek merkezden yönetilir.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-900">Görüntüleme</p>
            <p className="mt-1 text-sm text-gray-500">
              Para birimi yalnızca gösterim katmanını etkiler. Kayıtlar mevcut
              veri mantığıyla saklanmaya devam eder.
            </p>
          </div>

          <div className="max-w-sm">
            <label className="mb-1 block text-sm text-gray-600">
              Görüntüleme Para Birimi
            </label>
            <select
              value={settings.currencyCode}
              onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
            >
              {currencyOptions.map((option) => (
                <option key={option} value={option}>
                  {getCurrencyLabel(option)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-900">Güvenlik ve Onay</p>
            <p className="mt-1 text-sm text-gray-500">
              Riskli işlemler için ek onay açabilir, kullanım sırasında yanlış
              silme veya içe aktarma ihtimalini azaltabilirsiniz.
            </p>
          </div>

          <label className="flex items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-gray-200">
            <input
              type="checkbox"
              checked={settings.confirmDestructiveActions}
              onChange={(e) => onToggleConfirmations(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">
                Kritik işlemlerde onay iste
              </span>
              <span className="mt-1 block text-xs leading-5 text-gray-500">
                Borç, kasa, ödeme silme ve JSON içe aktarma öncesinde ek onay
                gösterir. Önerilen ayardır.
              </span>
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}
