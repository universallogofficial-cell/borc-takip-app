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
  return (
    <div
      className={`rounded-2xl p-5 shadow-sm ring-1 ${
        isEditingCash
          ? "bg-emerald-50 ring-emerald-300"
          : "bg-white ring-gray-200"
      }`}
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        {isEditingCash ? "Kasa Düzenle" : "Yeni Kasa Ekle"}
      </h2>

      <form
        onSubmit={(e) => {
          console.info("CashForm submit tetiklendi");
          onSubmit(e);
        }}
        className="grid gap-4 md:grid-cols-2"
      >
        <div>
          <label className="mb-1 block text-sm text-gray-600">Kasa Adı</label>
          <input
            type="text"
            value={cashName}
            onChange={(e) => setCashName(e.target.value)}
            disabled={addingCash}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            placeholder="Örn: Ana Kasa"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">Bakiye</label>
          <input
            type="number"
            value={cashBalance}
            onChange={(e) => setCashBalance(e.target.value)}
            disabled={addingCash}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            placeholder="Örn: 5000"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-gray-600">Not</label>
          <textarea
            value={cashNote}
            onChange={(e) => setCashNote(e.target.value)}
            disabled={addingCash}
            className="min-h-[80px] w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            placeholder="İsteğe bağlı not"
          />
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={addingCash}
            className="rounded-xl bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-50"
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
