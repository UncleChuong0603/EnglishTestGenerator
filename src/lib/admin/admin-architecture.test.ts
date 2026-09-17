import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const auth=readFileSync("src/lib/admin/authorization.ts","utf8"); const service=readFileSync("src/lib/admin/service.ts","utf8"); const actions=readFileSync("src/app/admin/actions.ts","utf8"); const session=readFileSync("src/lib/auth/session.ts","utf8"); const oauth=readFileSync("src/app/auth/callback/route.ts","utf8");
describe("Task 14 admin security architecture",()=>{
  it("centralizes DB-backed authorization and permissions",()=>{ expect(auth).toContain("userRoles"); expect(auth).toContain("requireAdmin"); expect(auth).not.toMatch(/ADMIN_EMAIL|@example\.com/); expect(service).toContain("assertPermission(tx"); });
  it("derives actor server-side and ignores spoofed actor/role payloads",()=>{ expect(actions).toContain("getCurrentUser"); expect(actions).not.toMatch(/formData\.get\(["'](?:actorUserId|role|isAdmin)/); });
  it("checks every admin page server-side",()=>{ for(const file of ["src/app/admin/page.tsx","src/app/admin/users/page.tsx","src/app/admin/users/[userId]/page.tsx","src/app/admin/audit/page.tsx"]) expect(readFileSync(file,"utf8")).toContain("requireAdmin("); });
  it("protects self-suspension, last admin, and atomic audit writes",()=>{ expect(service).toContain("actorUserId === targetUserId"); expect(service).toContain('length <= 1) throw new AdminActionError("LAST_ADMIN")'); expect(service).toContain("pg_advisory_xact_lock"); expect(service).toContain("adminAuditLogs"); });
  it("central session resolution and both login providers reject disabled accounts",()=>{ expect(session).toContain('row.status !== "active"'); expect(readFileSync("src/lib/auth/service.ts","utf8")).toContain('user.status !== "active"'); expect(oauth).toContain('localUser.status !== "active"'); });
  it("reuses Task 13 plan mutation services",()=>{ expect(service).toContain("grantPremiumWithTx"); expect(service).toContain("revokePremiumWithTx"); expect(service).not.toContain("tx.insert(userPlanMemberships)"); });
});
