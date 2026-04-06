import { describe, expect, it } from "vitest";
import { getErrorMessage } from "@/lib/errorMessage";

describe("getErrorMessage", () => {
  it("returns message from Error instances", () => {
    expect(getErrorMessage(new Error("boom"), "fallback")).toBe("boom");
  });

  it("returns message from plain objects", () => {
    expect(
      getErrorMessage({ message: "new row violates row-level security policy" }, "fallback"),
    ).toBe("new row violates row-level security policy");
  });

  it("returns fallback for unknown values", () => {
    expect(getErrorMessage({ code: "PGRST301" }, "fallback")).toBe("fallback");
  });
});
