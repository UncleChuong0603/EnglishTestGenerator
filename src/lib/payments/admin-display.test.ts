import { describe, expect, it } from "vitest";
import { money, paymentDate, productLabel, statusLabel } from "./admin-display";

describe("admin payment presentation", () => {
  it("humanizes every persisted status in both languages", () => {
    for (const status of ["PENDING", "PAID", "EXPIRED", "CANCELLED", "FAILED"]) {
      expect(statusLabel(status, true)).not.toBe(status);
      expect(statusLabel(status, false)).not.toBe(status);
    }
    expect(statusLabel("PAID", true)).toBe("Đã thanh toán");
  });
  it("formats the actual VND amount and Vietnam timestamps", () => {
    expect(money(139000, "VND", "vi")).toContain("139.000");
    expect(paymentDate(new Date("2026-09-20T03:31:00Z"), "vi")).toMatch(/20\/0?9\/2026/);
    expect(productLabel("PREMIUM_90_DAYS", true)).toContain("90 ngày");
  });
});
