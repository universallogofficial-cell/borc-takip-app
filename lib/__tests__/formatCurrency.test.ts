import {
  formatCurrency,
  formatDateTime,
  formatTextValue,
  getCurrencyLabel,
} from "@/lib/formatCurrency";

describe("formatCurrency helpers", () => {
  it("para birimini ve yuvarlamayi formatlar", () => {
    const formatted = formatCurrency(1234.567, "TRY");

    expect(formatted).toContain("₺");
    expect(formatted).toContain("1.234");
  });

  it("gecersiz tarih ve bos metin fallbacklerini uygular", () => {
    expect(formatDateTime("invalid")).toBe("Tarih yok");
    expect(formatTextValue("   ")).toBe("Bilgi yok");
    expect(formatTextValue(null, "Yok")).toBe("Yok");
  });

  it("para birimi etiketini dondurur", () => {
    expect(getCurrencyLabel("TRY")).toBe("Türk Lirası (TRY)");
    expect(getCurrencyLabel("USD")).toBe("Amerikan Doları (USD)");
    expect(getCurrencyLabel("EUR")).toBe("Euro (EUR)");
  });
});
