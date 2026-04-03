import {
  buildBackupPreview,
  createBackupPayload,
  parseBackupPayload,
} from "@/lib/backup";

describe("backup helpers", () => {
  it("gecerli backup payloadini parse eder ve preview uretir", () => {
    const payload = createBackupPayload({
      ownerUserId: "user-1",
      debts: [
        {
          id: 1,
          created_at: "2026-03-01T10:00:00Z",
          user_id: "user-1",
          name: "Borç",
          institution: "Banka",
          product_type: "Kredi",
          remaining_debt: 100,
          minimum_payment: 50,
          rate: 2,
          due_day: 15,
        },
      ],
      cash: [
        {
          id: 1,
          created_at: "2026-03-01T10:00:00Z",
          user_id: "user-1",
          name: "Kasa",
          balance: 500,
          note: null,
        },
      ],
      payments: [
        {
          id: 1,
          created_at: "2026-03-10T10:00:00Z",
          user_id: "user-1",
          debt_id: 1,
          cash_id: 1,
          amount: 50,
          note: null,
        },
      ],
    });

    const parsed = parseBackupPayload(JSON.stringify(payload));

    expect(parsed.ownerUserId).toBe("user-1");
    expect(buildBackupPreview(parsed, "yedek.json")).toEqual({
      fileName: "yedek.json",
      version: "1.0",
      exportedAt: payload.exportedAt,
      debtCount: 1,
      cashCount: 1,
      paymentCount: 1,
    });
  });

  it("bozuk iliski veya owner bilgisi olan backup dosyasini reddeder", () => {
    expect(() =>
      parseBackupPayload(
        JSON.stringify({
          version: "1.0",
          exportedAt: new Date().toISOString(),
          ownerUserId: 123,
          debts: [],
          cash: [],
          payments: [],
        }),
      ),
    ).toThrow("Yedek dosyasındaki owner bilgisi geçersiz.");

    expect(() =>
      parseBackupPayload(
        JSON.stringify({
          version: "1.0",
          exportedAt: new Date().toISOString(),
          ownerUserId: "user-1",
          debts: [
            {
              id: 1,
              created_at: "2026-03-01T10:00:00Z",
              name: "Borç",
              institution: null,
              product_type: null,
              remaining_debt: 100,
              minimum_payment: null,
              rate: null,
              due_day: null,
            },
          ],
          cash: [],
          payments: [
            {
              id: 1,
              created_at: "2026-03-10T10:00:00Z",
              debt_id: 1,
              cash_id: 99,
              amount: 50,
              note: null,
            },
          ],
        }),
      ),
    ).toThrow("Yedek dosyasındaki ödeme ilişkileri geçersiz.");
  });
});
