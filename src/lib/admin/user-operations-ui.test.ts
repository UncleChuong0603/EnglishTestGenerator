import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const list = readFileSync("src/app/admin/users/page.tsx", "utf8");
const detail = readFileSync("src/app/admin/users/[userId]/page.tsx", "utf8");
const snapshot = readFileSync(
  "src/app/admin/users/[userId]/snapshot/page.tsx",
  "utf8",
);
const service = readFileSync("src/lib/admin/service.ts", "utf8");
const actions = readFileSync("src/app/admin/actions.ts", "utf8");
const settings = readFileSync("src/app/settings/page.tsx", "utf8");
const dashboard = readFileSync("src/app/dashboard/page.tsx", "utf8");
const analytics = readFileSync("src/app/admin/analytics/page.tsx", "utf8");

describe("admin user operations center", () => {
  it("keeps list operations server-side and preserves operational filters", () => {
    for (const value of [
      "plan",
      "status",
      "role",
      "verified",
      "activity",
      "sort",
    ])
      expect(list).toContain(`name=\"${value}\"`);
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
    expect(list).toContain('user.plan==="PREMIUM"');
    expect(list).toContain(
      "getLearnerActivityState({learningDays:user.learningDays,lastLearningAt:user.lastLearningAt})",
    );
  });
  it("organizes detail into support tabs and confirms sensitive actions", () => {
    for (const tab of ["overview", "learning", "plan", "security", "activity"])
      expect(detail).toMatch(new RegExp(`key:\\s*\"${tab}\"`));
    expect(detail.match(/ConfirmSubmit/g)?.length).toBeGreaterThanOrEqual(4);
    expect(detail).toContain("currentPaid");
    expect(service).toContain("'PAYOS','APPLE_IAP','GOOGLE_PLAY'");
  });
  it("requires and surfaces an audited suspension reason", () => {
    expect(detail).toContain('name="reason"');
    expect(detail).toContain("suspensionReason");
    expect(detail).toContain("ops.suspension.actorEmail");
    expect(actions).toContain('formData.get("reason")');
    expect(service).toContain('throw new AdminActionError("INVALID_REASON")');
    expect(service).toContain("{ reason: normalizedReason }");
  });
  it("removes learner context from learner and admin UI", () => {
    for (const source of [settings, dashboard, detail, analytics]) {
      expect(source).not.toContain("LearnerContextPrompt");
      expect(source).not.toContain("getLearnerContext");
      expect(source).not.toContain("Learner context");
      expect(source).not.toContain("Bối cảnh người học");
    }
    expect(settings).not.toContain('"context"');
  });
  it("keeps the learner snapshot read-only and server-authorized", () => {
    expect(snapshot).toContain('requireAdmin("USER_READ")');
    expect(snapshot).not.toMatch(
      /action=|consumeUsage|insert\(|update\(|delete\(/,
    );
    expect(snapshot).toContain("getToeicProgress");
    expect(snapshot).toContain("getUsageStatus");
  });
  it("never projects password hashes, tokens, or provider secrets", () => {
    expect(detail).not.toMatch(
      /passwordHash|sessionTokenHash|providerAccountId|providerPaymentId/,
    );
    expect(snapshot).not.toMatch(
      /passwordHash|sessionTokenHash|providerAccountId|providerPaymentId/,
    );
  });
});
