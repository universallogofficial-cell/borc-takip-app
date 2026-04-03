import type { CashItem, DebtRow, PaymentFormData } from "@/types/finance";

type PaymentFormProps = {
  debts: DebtRow[];
  cashList: CashItem[];
  paymentForm: PaymentFormData;
  setPaymentForm: React.Dispatch<React.SetStateAction<PaymentFormData>>;
  addingPayment: boolean;
  isEditingPayment: boolean;
  editingPaymentId: number | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export default function PaymentForm({
  debts,
  cashList,
  paymentForm,
  setPaymentForm,
  addingPayment,
  isEditingPayment,
  editingPaymentId,
  onSubmit,
  onCancel,
}: PaymentFormProps) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-sm ring-1 ${
        isEditingPayment
          ? "bg-sky-50 ring-sky-300"
          : "bg-white ring-gray-200"
      }`}
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        {isEditingPayment ? "Ödeme Düzenle" : "Ödeme Yap"}
      </h2>
      {isEditingPayment && editingPaymentId !== null && (
        <p className="mb-4 text-sm text-sky-700">
          Düzenlenen ödeme ID: {editingPaymentId}
        </p>
      )}

      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-gray-600">Borç Seç</label>
          <select
            value={paymentForm.debtId}
            onChange={(e) =>
              setPaymentForm((prev) => ({ ...prev, debtId: e.target.value }))
            }
            disabled={addingPayment}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
          >
            <option value="">Borç seçin</option>
            {debts.map((debt) => (
              <option key={debt.id} value={debt.id}>
                {debt.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">Kasa Seç</label>
          <select
            value={paymentForm.cashId}
            onChange={(e) =>
              setPaymentForm((prev) => ({ ...prev, cashId: e.target.value }))
            }
            disabled={addingPayment}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
          >
            <option value="">Kasa seçin</option>
            {cashList.map((cash) => (
              <option key={cash.id} value={cash.id}>
                {cash.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">
            Ödeme Tutarı
          </label>
          <input
            type="number"
            step="0.01"
            value={paymentForm.amount}
            onChange={(e) =>
              setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))
            }
            disabled={addingPayment}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            placeholder="Örn: 1000"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-gray-600">Not</label>
          <textarea
            value={paymentForm.note}
            onChange={(e) =>
              setPaymentForm((prev) => ({ ...prev, note: e.target.value }))
            }
            disabled={addingPayment}
            className="min-h-[80px] w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
            placeholder="Ödeme notu"
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={addingPayment}
            className="rounded-xl bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {addingPayment
              ? isEditingPayment
                ? "Güncelleniyor..."
                : "Kaydediliyor..."
              : isEditingPayment
                ? "Güncelle"
                : "Ödemeyi Kaydet"}
          </button>
          {isEditingPayment && (
            <button
              type="button"
              onClick={onCancel}
              disabled={addingPayment}
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
