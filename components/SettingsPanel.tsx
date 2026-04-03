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
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Ayarlar</h3>
        <p className="text-sm text-gray-500">
          Görüntüleme tercihleri ve kritik işlem korumaları burada tutulur.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-gray-600">
            Görüntüleme Para Birimi
          </label>
          <select
            value={settings.currencyCode}
            onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          >
            {currencyOptions.map((option) => (
              <option key={option} value={option}>
                {getCurrencyLabel(option)}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            Gösterim katmanı değişir, kayıtlar mevcut para birimi mantığıyla
            saklanmaya devam eder.
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <label className="flex items-start gap-3">
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
              <span className="block text-xs text-gray-500">
                Borç, kasa, ödeme silme ve JSON içe aktarma öncesinde ek onay
                ister.
              </span>
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}
