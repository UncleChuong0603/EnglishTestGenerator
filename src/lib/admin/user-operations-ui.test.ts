import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const list = readFileSync("src/app/admin/users/page.tsx", "utf8");
const detail = readFileSync("src/app/admin/users/[userId]/page.tsx", "utf8");
const snapshot = readFileSync("src/app/admin/users/[userId]/snapshot/page.tsx", "utf8");
const service = readFileSync("src/lib/admin/service.ts", "utf8");

describe("admin user operations center", () => {
  it("keeps list operations server-side and preserves operational filters", () => {
    for (const value of ["plan", "status", "role", "verified", "activity", "sort"]) expect(list).toContain(`name=\"${value}\"`);
    expect(service).toContain("limit(USER_PAGE_SIZE)");
    expect(service).toContain("ilike(users.emailNormalized");
    expect(service).toContain("ilike(profiles.fullName");
  });
  it("does not render meaningless zero-result pagination and localizes canonical states", () => {
    expect(list).toContain("data.total>0&&pages>1");
    expect(list).toContain("Đang hoạt động");
    expect(detail).toContain("Đang hiệu lực");
    expect(detail).toContain("Quản trị viên cấp");
  });
  it("distinguishes plans and learner retention state", () => {
    expect(service).toContain("userRoles");
    expect(list).toContain('user.premium?"Premium":"Free"');
    expect(list).toContain('user.retentionState==="NO_LEARNING"');
  });
  it("organizes detail into support tabs and confirms sensitive actions", () => {
    for (const tab of ["overview", "learning", "plan", "security", "activity"]) expect(detail).toContain(`key:\"${tab}\"`);
    expect(detail.match(/ConfirmSubmit/g)?.length).toBeGreaterThanOrEqual(4);
    expect(detail).toContain("currentPaid");
    expect(service).toContain('eq(userPlanMemberships.source, "PAYMENT")');
  });
  it("keeps the learner snapshot read-only and server-authorized", () => {
    expect(snapshot).toContain('requireAdmin("USER_READ")');
    expect(snapshot).not.toMatch(/action=|consumeUsage|insert\(|update\(|delete\(/);
    expect(snapshot).toContain("getToeicProgress");
    expect(snapshot).toContain("getUsageStatus");
  });
  it("never projects password hashes, tokens, or provider secrets", () => {
    expect(detail).not.toMatch(/passwordHash|sessionTokenHash|providerAccountId|providerPaymentId/);
    expect(snapshot).not.toMatch(/passwordHash|sessionTokenHash|providerAccountId|providerPaymentId/);
  });
});
