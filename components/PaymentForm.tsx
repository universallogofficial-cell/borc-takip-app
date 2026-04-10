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
      className={`finance-panel p-5 md:p-6 ${
        isEditingPayment ? "border-sky-200 bg-sky-50/70" : ""
      }`}
    >
      <div className="mb-5">
        <p className="finance-kicker">Ödeme Planı</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          {isEditingPayment ? "Ödeme kaydını güncelle" : "Yeni ödeme işle"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Borç ve kasa seçildiğinde güvenli ödeme aralığını anında gör, tutarı kontrollü belirle.
        </p>
      </div>

      {isEditingPayment && editingPaymentId !== null && (
        <p className="mb-4 rounded-[18px] bg-sky-100 px-3 py-2 text-sm text-sky-800">
          Düzenlenen ödeme ID: {editingPaymentId}
        </p>
      )}

      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Borç Seç</label>
          <select
            value={paymentForm.debtId}
            onChange={(e) =>
              setPaymentForm((prev) => ({ ...prev, debtId: e.target.value }))
            }
            disabled={addingPayment}
            className="finance-field"
          >
            <option value="">Borç seçin</option>
            {debts.map((debt) => (
              <option key={debt.id} value={debt.id}>
                {debt.name}
              </option>
            ))}
          </select>
          {selectedDebt && (
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Kalan: {formatCurrency(selectedDebtRemaining, currencyCode)} • Asgari:{" "}
              {formatCurrency(selectedDebtMinimum, currencyCode)}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Kasa Seç</label>
          <select
            value={paymentForm.cashId}
            onChange={(e) =>
              setPaymentForm((prev) => ({ ...prev, cashId: e.target.value }))
            }
            disabled={addingPayment}
            className="finance-field"
          >
            <option value="">Kasa seçin</option>
            {cashList.map((cash) => (
              <option key={cash.id} value={cash.id}>
                {cash.name}
              </option>
            ))}
          </select>
          {selectedCash && (
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Kullanılabilir bakiye: {formatCurrency(selectedCashBalance, currencyCode)}
            </p>
          )}
        </div>

        <div className="finance-surface-muted md:col-span-2 rounded-[24px] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Hızlı Tutar
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={addingPayment || selectedDebtMinimum <= 0}
              onClick={() => applySuggestedAmount(selectedDebtMinimum)}
              className="finance-button-ghost rounded-full px-3 py-1.5"
            >
              Asgari ödeme
            </button>
            <button
              type="button"
              disabled={addingPayment || selectedDebtRemaining <= 0}
              onClick={() => applySuggestedAmount(selectedDebtRemaining)}
              className="finance-button-ghost rounded-full px-3 py-1.5"
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
              className="finance-button-ghost rounded-full px-3 py-1.5"
            >
              Güvenli maksimum
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Ödeme Tutarı</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={paymentForm.amount}
            onChange={(e) =>
              setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))
            }
            disabled={addingPayment}
            className="finance-field"
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
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Seçili kasa ve borç için mantıklı aralık otomatik kontrol edilir.
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Not</label>
          <textarea
            value={paymentForm.note}
            onChange={(e) =>
              setPaymentForm((prev) => ({ ...prev, note: e.target.value }))
            }
            disabled={addingPayment}
            className="finance-field min-h-[110px]"
            placeholder="İsteğe bağlı kısa not"
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={addingPayment}
            className="finance-button-secondary"
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
