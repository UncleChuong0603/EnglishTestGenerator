import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
describe("support feedback migration",()=>{const sql=readFileSync("drizzle/0027_support_feedback.sql","utf8");it("stores categorized tickets with a small status workflow",()=>{expect(sql).toContain('CREATE TABLE "support_tickets"');expect(sql).toContain("'TECHNICAL','CONTENT','PAYMENT','SUGGESTION','OTHER'");expect(sql).toContain("'NEW','IN_PROGRESS','RESOLVED'");expect(sql).toContain("support_tickets_status_created_idx")})});
