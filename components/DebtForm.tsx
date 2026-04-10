import { useState } from "react";

type DebtFormProps = {
  debtName: string;
  setDebtName: (v: string) => void;
  institution: string;
  setInstitution: (v: string) => void;
  productType: string;
  setProductType: (v: string) => void;
  remainingDebt: string;
  setRemainingDebt: (v: string) => void;
  minimumPayment: string;
  setMinimumPayment: (v: string) => void;
  rate: string;
  setRate: (v: string) => void;
  dueDay: string;
  setDueDay: (v: string) => void;
  addingDebt: boolean;
  isEditingDebt: boolean;
  editingDebtId: number | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

const TOP_BANK_OPTIONS = [
  "Akbank",
  "Garanti BBVA",
  "Is Bankasi",
  "Yapi Kredi",
  "QNB",
  "DenizBank",
  "TEB",
  "VakıfBank",
  "Ziraat Bankası",
  "Halkbank",
] as const;

const PRODUCT_OPTIONS = [
  "Kredi Kartı",
  "İhtiyaç Kredisi",
  "KMH / Esnek Hesap",
  "Diğer",
] as const;

function matchesOption(value: string, options: readonly string[]) {
  return options.some((option) => option === value);
}

export default function DebtForm({
  debtName,
  setDebtName,
  institution,
  setInstitution,
  productType,
  setProductType,
  remainingDebt,
  setRemainingDebt,
  minimumPayment,
  setMinimumPayment,
  rate,
  setRate,
  dueDay,
  setDueDay,
  addingDebt,
  isEditingDebt,
  editingDebtId,
  onSubmit,
  onCancel,
}: DebtFormProps) {
  const [institutionMode, setInstitutionMode] = useState<"preset" | "other">(
    "preset",
  );
  const [productMode, setProductMode] = useState<"preset" | "other">("preset");

  const institutionSelectValue =
    institutionMode === "other" ||
    (institution.trim() !== "" && !matchesOption(institution, TOP_BANK_OPTIONS))
      ? "Diğer"
      : matchesOption(institution, TOP_BANK_OPTIONS)
        ? institution
        : "";
  const productSelectValue =
    productMode === "other" ||
    (productType.trim() !== "" && !matchesOption(productType, PRODUCT_OPTIONS))
      ? "Diğer"
      : matchesOption(productType, PRODUCT_OPTIONS)
        ? productType
        : "";
  const showCustomInstitutionInput =
    institutionMode === "other" ||
    (institution.trim() !== "" && !matchesOption(institution, TOP_BANK_OPTIONS));
  const showCustomProductInput =
    productMode === "other" ||
    (productType.trim() !== "" && !matchesOption(productType, PRODUCT_OPTIONS));

  return (
    <div
      className={`finance-panel p-5 md:p-6 ${
        isEditingDebt ? "border-amber-200 bg-amber-50/70" : ""
      }`}
    >
      <div className="mb-5">
        <p className="finance-kicker">Borç Portföyü</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          {isEditingDebt ? "Borç kaydını güncelle" : "Yeni borç oluştur"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Kurum, ürün, kalan borç ve ödeme detaylarını tek akışta girin.
        </p>
      </div>

      {isEditingDebt && editingDebtId !== null && (
        <p className="mb-4 rounded-[18px] bg-amber-100 px-3 py-2 text-sm text-amber-800">
          Düzenlenen kayıt ID: {editingDebtId}
        </p>
      )}

      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Borç Adı</label>
          <input
            type="text"
            value={debtName}
            onChange={(e) => setDebtName(e.target.value)}
            disabled={addingDebt}
            className="finance-field"
            placeholder="Örn: Ana kredi kartım"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Kurum</label>
          <select
            value={institutionSelectValue}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "Diğer") {
                setInstitutionMode("other");
                if (matchesOption(institution, TOP_BANK_OPTIONS)) {
                  setInstitution("");
                }
                return;
              }

              setInstitutionMode("preset");
              setInstitution(value);
            }}
            disabled={addingDebt}
            className="finance-field"
          >
            <option value="">Kurum seçin</option>
            {TOP_BANK_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            <option value="Diğer">Diğer</option>
          </select>
          {showCustomInstitutionInput && (
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              disabled={addingDebt}
              className="finance-field mt-3"
              placeholder="Kurum adını girin"
            />
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Ürün Tipi</label>
          <select
            value={productSelectValue}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "Diğer") {
                setProductMode("other");
                if (matchesOption(productType, PRODUCT_OPTIONS)) {
                  setProductType("");
                }
                return;
              }

              setProductMode("preset");
              setProductType(value);
            }}
            disabled={addingDebt}
            className="finance-field"
          >
            <option value="">Ürün tipi seçin</option>
            {PRODUCT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {showCustomProductInput && (
            <input
              type="text"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              disabled={addingDebt}
              className="finance-field mt-3"
              placeholder="Ürün tipini yazın"
            />
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Toplam Borç</label>
          <input
            type="number"
            min="0"
            value={remainingDebt}
            onChange={(e) => setRemainingDebt(e.target.value)}
            disabled={addingDebt}
            className="finance-field"
            placeholder="Örn: 15000"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Asgari Ödeme Tutarı
          </label>
          <input
            type="number"
            min="0"
            value={minimumPayment}
            onChange={(e) => setMinimumPayment(e.target.value)}
            disabled={addingDebt}
            className="finance-field"
            placeholder="Örn: 1200"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Faiz Oranı</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            disabled={addingDebt}
            className="finance-field"
            placeholder="Örn: 3.99"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Son Ödeme Günü</label>
          <input
            type="number"
            min="1"
            max="31"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            disabled={addingDebt}
            className="finance-field"
            placeholder="Örn: 15"
          />
        </div>

        <div className="finance-surface-muted md:col-span-2 rounded-[24px] p-4 text-sm text-slate-600">
          Bu kayıt ödeme planı, risk görünümü ve yaklaşan ödemeler ekranında birlikte
          kullanılır. Toplam borç ve asgari ödeme alanlarını mümkün olduğunca güncel
          tutun.
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={addingDebt}
            className="finance-button-primary"
          >
            {addingDebt
              ? isEditingDebt
                ? "Güncelleniyor..."
                : "Kaydediliyor..."
              : isEditingDebt
                ? "Güncelle"
                : "Borcu Kaydet"}
          </button>
          {isEditingDebt && (
            <button
              type="button"
              onClick={onCancel}
              disabled={addingDebt}
              className="finance-button-ghost"
            >
              İptal
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
