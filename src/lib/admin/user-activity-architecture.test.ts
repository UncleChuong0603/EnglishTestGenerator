import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const query = readFileSync("src/lib/admin/user-activity.ts", "utf8");
const list = readFileSync("src/app/admin/users/page.tsx", "utf8");
const detail = readFileSync("src/app/admin/users/[userId]/page.tsx", "utf8");
const analytics = readFileSync("src/app/admin/analytics/page.tsx", "utf8");

describe("Task 27 admin activity architecture", () => {
  it("uses one grouped list query plus one batched last-action query", () => {
    expect(query).toContain("meaningful_sessions as");
    expect(query).toContain("getLastMeaningfulActions(rawRows.map");
    expect(query).not.toContain("for (const userId of userIds)");
  });

  it("bounds timeline results and normalizes multiple authoritative sources", () => {
    expect(query).toContain("Math.min(50");
    for (const source of ["learner_goals", "diagnostic_runs", "practice_sessions", "full_mock_runs", "payment_orders", "user_plan_memberships"]) expect(query).toContain(source);
  });

  it("keeps protected fields and question content out of timeline DTOs", () => {
    for (const secret of ["password_hash", "session_token_hash", "guest_owner_hash", "provider_payment_id", "question_text", "correct_option_id"]) expect(query).not.toContain(secret);
  });

  it("reuses server-side USER_READ authorization", () => {
    expect(list).toContain('requireAdmin("USER_READ")');
    expect(detail).toContain('requireAdmin("USER_READ")');
  });

  it("adds retention to the existing user and analytics surfaces", () => {
    expect(list).toContain("getRetentionDiagnostics");
    expect(detail).toContain("getUserActivityTimeline");
    expect(analytics).toContain("getRetentionDiagnostics");
  });
});
