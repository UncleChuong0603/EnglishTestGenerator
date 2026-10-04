import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const read = (path: string) => readFileSync(path, "utf8");

describe("cross-platform billing architecture", () => {
  it("resolves all Premium sources through one membership table", () => {
    const migration = read("drizzle/0053_cross_platform_billing.sql");
    expect(migration).toContain(
      "'PAYOS','APPLE_IAP','GOOGLE_PLAY','TRIAL','PROMOTION','ADMIN'",
    );
    expect(read("src/lib/entitlements/service.ts")).toContain(
      "activePremiumMembership",
    );
  });
  it("never persists raw store proofs or trusts a client Premium flag", () => {
    const migration = read("drizzle/0053_cross_platform_billing.sql");
    expect(migration).not.toMatch(/purchase_token|signed_transaction|receipt/);
    const route = read("src/app/api/v1/billing/store/verify/route.ts");
    expect(route).toContain("verifyStorePurchase");
    expect(route).not.toMatch(/isPremium|premium:\s*true/);
  });
  it("verifies Apple JWS, Google publisher state and push identity server-side", () => {
    expect(read("src/lib/store-billing/apple.ts")).toContain(
      "SignedDataVerifier",
    );
    expect(read("src/lib/store-billing/google.ts")).toContain(
      "purchases/subscriptionsv2/tokens",
    );
    expect(read("src/lib/store-billing/google.ts")).toContain("verifyIdToken");
  });
  it("deduplicates provider events before applying lifecycle changes", () => {
    const service = read("src/lib/store-billing/service.ts");
    expect(service).toContain("onConflictDoNothing");
    expect(service.indexOf("if (!inserted.length)")).toBeLessThan(
      service.indexOf("if (owned && shouldAdvancePurchase)"),
    );
  });
});
