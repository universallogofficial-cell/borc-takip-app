import { getDebtLifecycleStatus, isClosedDebt } from "@/lib/debtLifecycle";

describe("debtLifecycle", () => {
  it("remaining debt sifir veya altindaysa kapanmis sayar", () => {
    expect(isClosedDebt(0)).toBe(true);
    expect(isClosedDebt(-10)).toBe(true);
    expect(isClosedDebt(0.004)).toBe(true);
  });

  it("pozitif kalan borcu aktif sayar", () => {
    expect(isClosedDebt(10)).toBe(false);
    expect(getDebtLifecycleStatus(1250)).toBe("active");
    expect(getDebtLifecycleStatus(0)).toBe("closed");
  });
});
