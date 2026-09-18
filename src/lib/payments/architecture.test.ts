import { readFileSync } from "node:fs"; import { describe, expect, it } from "vitest"; const read=(p:string)=>readFileSync(p,"utf8");
describe("payment architecture",()=>{
  it("does not trust redirect parameters",()=>{const page=read("src/app/billing/return/page.tsx");expect(page).not.toContain("success=true");expect(page).not.toContain("status=PAID")});
  it("uses official webhook verification",()=>{expect(read("src/lib/payments/provider.ts")).toContain("webhooks.verify");expect(read("src/app/api/payments/payos/webhook/route.ts")).toContain("processWebhook")});
  it("acknowledges verified unmatched samples but separates verification and processing failures",()=>{const service=read("src/lib/payments/service.ts"),route=read("src/app/api/payments/payos/webhook/route.ts");expect(service).toContain('status: "UNMATCHED"');expect(service).toContain('PaymentWebhookError("VERIFICATION_FAILED")');expect(route).toContain('"webhook_processing_unavailable"');expect(route).toContain('verificationFailed?400:503')});
  it("keeps secrets server-only",()=>{expect(read(".env.example")).not.toContain("NEXT_PUBLIC_PAYOS");expect(read("src/lib/payments/provider.ts")).toContain('import "server-only"')});
  it("production-locks the E2E confirmation helper",()=>{const route=read("src/app/api/test/payments/confirm/route.ts");expect(route).toContain('process.env.NODE_ENV === "production"');expect(route).toContain('TASK17_E2E_PAYMENT_ENABLED !== "true"');expect(route).toContain('process.env.PAYMENT_PROVIDER !== "FAKE"')});
  it("ignores client financial fields",()=>{const action=read("src/app/billing/actions.ts");expect(action).toContain('formData.get("productKey")');for(const field of ["amount","currency","days","plan","status","paid","expiresAt"])expect(action).not.toContain(`formData.get("${field}")`)});
  it("does not sell ranking advantages",()=>{const catalog=read("src/lib/entitlements/catalog.ts");expect(catalog).not.toContain("RANK");expect(catalog).not.toContain("CHALLENGE")});
});
