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
  return (
    <div
      className={`rounded-2xl p-5 shadow-sm ring-1 ${
        isEditingDebt ? "bg-amber-50 ring-amber-300" : "bg-white ring-gray-200"
      }`}
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        {isEditingDebt ? "Borç Düzenle" : "Yeni Borç Ekle"}
      </h2>
      {isEditingDebt && editingDebtId !== null && (
        <p className="mb-4 text-sm text-amber-700">
          Düzenlenen kayıt ID: {editingDebtId}
        </p>
      )}

      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-gray-600">Borç Adı</label>
          <input
            type="text"
            value={debtName}
            onChange={(e) => setDebtName(e.target.value)}
            disabled={addingDebt}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            placeholder="Örn: Kredi Kartı"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">Kurum</label>
          <input
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            disabled={addingDebt}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            placeholder="Örn: Akbank"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">Ürün Tipi</label>
          <input
            type="text"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            disabled={addingDebt}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            placeholder="Örn: Kredi Kartı / Kredi / İhtiyaç Kredisi"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">Kalan Borç</label>
          <input
            type="number"
            value={remainingDebt}
            onChange={(e) => setRemainingDebt(e.target.value)}
            disabled={addingDebt}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            placeholder="Örn: 15000"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">
            Minimum Ödeme
          </label>
          <input
            type="number"
            value={minimumPayment}
            onChange={(e) => setMinimumPayment(e.target.value)}
            disabled={addingDebt}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            placeholder="Örn: 1200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">Faiz Oranı</label>
          <input
            type="number"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            disabled={addingDebt}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            placeholder="Örn: 3.99"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">
            Son Ödeme Günü
          </label>
          <input
            type="number"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            disabled={addingDebt}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            placeholder="Örn: 15"
          />
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={addingDebt}
            className="rounded-xl bg-gray-900 px-4 py-2 text-white transition hover:bg-gray-800 disabled:opacity-50"
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
              className="rounded-xl border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              İptal
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
