import { formatCurrency } from "@/lib/formatCurrency";
import { roundCurrency, toSafeNumber } from "@/lib/financeMath";
import type {
  CashItem,
  CurrencyCode,
  DebtRow,
  PaymentFormData,
} from "@/types/finance";

type PaymentFormProps = {
  debts: DebtRow[];
  cashList: CashItem[];
  paymentForm: PaymentFormData;
  setPaymentForm: React.Dispatch<React.SetStateAction<PaymentFormData>>;
  currencyCode: CurrencyCode;
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
  currencyCode,
  addingPayment,
  isEditingPayment,
  editingPaymentId,
  onSubmit,
  onCancel,
}: PaymentFormProps) {
  const selectedDebt =
    debts.find((debt) => String(debt.id) === paymentForm.debtId) ?? null;
  const selectedCash =
    cashList.find((cash) => String(cash.id) === paymentForm.cashId) ?? null;
  const selectedDebtMinimum = roundCurrency(
    toSafeNumber(selectedDebt?.minimum_payment ?? null),
  );
  const selectedDebtRemaining = roundCurrency(
    toSafeNumber(selectedDebt?.remaining_debt ?? null),
  );
  const selectedCashBalance = roundCurrency(toSafeNumber(selectedCash?.balance ?? null));
  const parsedAmount = Number(paymentForm.amount);
  const hasAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const exceedsBalance = hasAmount && selectedCash !== null && parsedAmount > selectedCashBalance;
  const exceedsDebt = hasAmount && selectedDebt !== null && parsedAmount > selectedDebtRemaining;

  const applySuggestedAmount = (value: number) => {
    setPaymentForm((prev) => ({
      ...prev,
      amount: value > 0 ? String(roundCurrency(value)) : "",
    }));
  };

  return (
    <div
      className={`rounded-[28px] p-5 shadow-sm ring-1 md:p-6 ${
        isEditingPayment ? "bg-sky-50 ring-sky-300" : "bg-white ring-gray-200"
      }`}
    >
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
          Ödeme Girişi
        </p>
        <h2 className="mt-2 text-xl font-semibold text-gray-900">
          {isEditingPayment ? "Ödeme Kaydını Düzenle" : "Ödeme Yap"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Borç ve kasa seçildiğinde uygun ödeme aralığını anında görün. Hızlı öneriler
          ile veri girişi daha kısa sürer.
        </p>
      </div>

      {isEditingPayment && editingPaymentId !== null && (
        <p className="mb-4 rounded-xl bg-sky-100 px-3 py-2 text-sm text-sky-800">
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
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-gray-500"
          >
            <option value="">Borç seçin</option>
            {debts.map((debt) => (
              <option key={debt.id} value={debt.id}>
                {debt.name}
              </option>
            ))}
          </select>
          {selectedDebt && (
            <p className="mt-2 text-xs leading-5 text-gray-500">
              Kalan: {formatCurrency(selectedDebtRemaining, currencyCode)} • Asgari:{" "}
              {formatCurrency(selectedDebtMinimum, currencyCode)}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">Kasa Seç</label>
          <select
            value={paymentForm.cashId}
            onChange={(e) =>
              setPaymentForm((prev) => ({ ...prev, cashId: e.target.value }))
            }
            disabled={addingPayment}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-gray-500"
          >
            <option value="">Kasa seçin</option>
            {cashList.map((cash) => (
              <option key={cash.id} value={cash.id}>
                {cash.name}
              </option>
            ))}
          </select>
          {selectedCash && (
            <p className="mt-2 text-xs leading-5 text-gray-500">
              Kullanılabilir bakiye: {formatCurrency(selectedCashBalance, currencyCode)}
            </p>
          )}
        </div>

        <div className="md:col-span-2 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Hızlı Tutar
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={addingPayment || selectedDebtMinimum <= 0}
              onClick={() => applySuggestedAmount(selectedDebtMinimum)}
              className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Asgari ödeme
            </button>
            <button
              type="button"
              disabled={addingPayment || selectedDebtRemaining <= 0}
              onClick={() => applySuggestedAmount(selectedDebtRemaining)}
              className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Borcu kapat
            </button>
            <button
              type="button"
              disabled={
                addingPayment ||
                selectedDebtRemaining <= 0 ||
                selectedCashBalance <= 0
              }
              onClick={() =>
                applySuggestedAmount(Math.min(selectedDebtRemaining, selectedCashBalance))
              }
              className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Güvenli maksimum
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">Ödeme Tutarı</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={paymentForm.amount}
            onChange={(e) =>
              setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))
            }
            disabled={addingPayment}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none transition focus:border-gray-500"
            placeholder="Örn: 1000"
          />
          {exceedsBalance && (
            <p className="mt-2 text-xs leading-5 text-red-600">
              Bu tutar seçili kasanın bakiyesini aşıyor.
            </p>
          )}
          {!exceedsBalance && exceedsDebt && (
            <p className="mt-2 text-xs leading-5 text-red-600">
              Bu tutar seçili borcun toplam borcundan büyük.
            </p>
          )}
          {!exceedsBalance && !exceedsDebt && selectedDebt && selectedCash && (
            <p className="mt-2 text-xs leading-5 text-gray-500">
              Seçili kasa ve borç için mantıklı aralık otomatik kontrol edilir.
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-gray-600">Not</label>
          <textarea
            value={paymentForm.note}
            onChange={(e) =>
              setPaymentForm((prev) => ({ ...prev, note: e.target.value }))
            }
            disabled={addingPayment}
            className="min-h-[88px] w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none transition focus:border-gray-500"
            placeholder="İsteğe bağlı kısa not"
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={addingPayment}
            className="rounded-xl bg-sky-600 px-4 py-2.5 text-white transition hover:bg-sky-700 disabled:opacity-50"
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
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              İptal
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
