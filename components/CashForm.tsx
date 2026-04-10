type CashFormProps = {
  cashName: string;
  setCashName: (v: string) => void;
  cashBalance: string;
  setCashBalance: (v: string) => void;
  cashNote: string;
  setCashNote: (v: string) => void;
  addingCash: boolean;
  isEditingCash: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export default function CashForm({
  cashName,
  setCashName,
  cashBalance,
  setCashBalance,
  cashNote,
  setCashNote,
  addingCash,
  isEditingCash,
  onSubmit,
  onCancel,
}: CashFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.info("[cash-form] submit", {
      isEditingCash,
      addingCash,
      hasCashName: cashName.trim().length > 0,
      cashBalance,
    });
    onSubmit(e);
  };

  return (
    <div
      className={`finance-panel p-5 md:p-6 ${
        isEditingCash ? "border-emerald-200 bg-emerald-50/70" : ""
      }`}
    >
      <div className="mb-5">
        <p className="finance-kicker">Nakit Yönetimi</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          {isEditingCash ? "Kasa kaydını güncelle" : "Yeni kasa oluştur"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Kasalarını ayrı ayrı izle, bakiyeyi güncel tut ve ödeme etkilerini daha net gör.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Kasa Adı</label>
          <input
            type="text"
            value={cashName}
            onChange={(e) => setCashName(e.target.value)}
            disabled={addingCash}
            className="finance-field"
            placeholder="Örn: Ana Kasa"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Bakiye</label>
          <input
            type="number"
            value={cashBalance}
            onChange={(e) => setCashBalance(e.target.value)}
            disabled={addingCash}
            className="finance-field"
            placeholder="Örn: 5000"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Not</label>
          <textarea
            value={cashNote}
            onChange={(e) => setCashNote(e.target.value)}
            disabled={addingCash}
            className="finance-field min-h-[110px]"
            placeholder="İsteğe bağlı not"
          />
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={addingCash}
            className="finance-button-secondary"
          >
            {addingCash
              ? isEditingCash
                ? "Güncelleniyor..."
                : "Kaydediliyor..."
              : isEditingCash
                ? "Güncelle"
                : "Kasayı Kaydet"}
          </button>
          {isEditingCash && (
            <button
              type="button"
              onClick={onCancel}
              disabled={addingCash}
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
