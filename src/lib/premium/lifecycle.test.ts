import { describe, expect, it } from "vitest";
import { getPremiumLifecycle, quoteResultingExpiry } from "./lifecycle";

describe("Premium lifecycle policy", () => {
  const now = new Date("2026-09-20T05:00:00.000Z");
  it("centralizes reminder boundaries", () => {
    expect(getPremiumLifecycle({ status: "ACTIVE", expiresAt: new Date(), daysRemaining: 15 })).toBe("ACTIVE_NORMAL");
    expect(getPremiumLifecycle({ status: "ACTIVE", expiresAt: new Date(), daysRemaining: 14 })).toBe("ACTIVE_EXPIRING_SOON");
    expect(getPremiumLifecycle({ status: "ACTIVE", expiresAt: new Date(), daysRemaining: 3 })).toBe("ACTIVE_EXPIRING_VERY_SOON");
    expect(getPremiumLifecycle({ status: "EXPIRED", expiresAt: now, daysRemaining: 0 })).toBe("EXPIRED");
  });
  it("preserves active unused time and starts expired/free access now", () => {
    const currentExpiry = new Date("2026-10-20T05:00:00.000Z");
    expect(quoteResultingExpiry({ status: "ACTIVE", expiresAt: currentExpiry, daysRemaining: 30 }, 90, now).toISOString()).toBe("2027-01-18T05:00:00.000Z");
    expect(quoteResultingExpiry({ status: "EXPIRED", expiresAt: new Date("2026-09-01"), daysRemaining: 0 }, 30, now).toISOString()).toBe("2026-10-20T05:00:00.000Z");
    expect(quoteResultingExpiry({ status: "FREE", expiresAt: null, daysRemaining: null }, 30, now).toISOString()).toBe("2026-10-20T05:00:00.000Z");
  });
});
