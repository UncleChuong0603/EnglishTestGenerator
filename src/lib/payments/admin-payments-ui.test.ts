import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const list = readFileSync("src/app/admin/payments/page.tsx", "utf8");
const detail = readFileSync("src/app/admin/payments/[id]/page.tsx", "utf8");
const access = readFileSync("src/app/admin/access-denied/page.tsx", "utf8");

describe("admin payment and access surfaces", () => {
  it("keeps list and detail authorization on the server", () => {
    expect(list).toContain('requireAdmin("ADMIN_DASHBOARD_READ")');
    expect(detail).toContain('requireAdmin("ADMIN_DASHBOARD_READ")');
  });
  it("provides localized recovery without leaking permissions", () => {
    expect(access).toContain("LanguageSwitcher");
    expect(access).toContain("Về khu học tập");
    expect(access).not.toMatch(/ADMIN_ROLE|ADMIN_DASHBOARD_READ/);
  });
  it("masks provider references and does not render secret fields", () => {
    expect(detail).toContain("slice(-4)");
    expect(detail).not.toMatch(/API_KEY|CHECKSUM_KEY|webhook.*secret/i);
  });
});
