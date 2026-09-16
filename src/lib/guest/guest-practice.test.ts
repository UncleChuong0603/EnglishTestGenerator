import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync("src/db/schema/index.ts", "utf8");
const migration = readFileSync("drizzle/0004_guest_practice.sql", "utf8");
const identity = readFileSync("src/lib/guest/identity.ts", "utf8");
const claim = readFileSync("src/lib/guest/migration.ts", "utf8");
const actions = readFileSync("src/app/practice/actions.ts", "utf8");

describe("guest practice security architecture", () => {
  it("enforces exactly one session owner and indexes guest lookup", () => {
    expect(schema).toContain("practice_sessions_owner_check");
    expect(migration).toContain('num_nonnulls("practice_sessions"."user_id", "practice_sessions"."guest_owner_hash") = 1');
    expect(migration).toContain("practice_sessions_guest_created_idx");
  });
  it("uses an opaque HttpOnly SameSite cookie with a seven-day TTL", () => {
    expect(identity).toContain("createToken()"); expect(identity).toContain("httpOnly: true");
    expect(identity).toContain('sameSite: "lax"'); expect(identity).toContain("GUEST_TTL_DAYS = 7");
  });
  it("claims only submitted, unexpired sessions transactionally and clears identity after success", () => {
    expect(claim).toContain("db.transaction"); expect(claim).toContain('eq(practiceSessions.status, "submitted")');
    expect(claim).toContain("gt(practiceSessions.expiresAt, new Date())"); expect(claim).toContain("clearGuestIdentity");
    expect(claim).toContain("diagnosticRuns"); expect(claim).toContain("diagnosticRunId");
  });
  it("derives ownership from server cookies rather than client identifiers", () => {
    expect(actions).toContain("getGuestOwnerHash()"); expect(actions).not.toContain('formData.get("guestSessionId")');
  });
});
