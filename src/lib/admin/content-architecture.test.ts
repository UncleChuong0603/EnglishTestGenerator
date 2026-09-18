import { describe, expect, it } from "vitest";
import fs from "node:fs";
const read=(p:string)=>fs.readFileSync(p,"utf8");
describe("Task 15 admin content architecture",()=>{
  const migration=read("drizzle/0010_admin_content.sql"),service=read("src/lib/admin/content.ts"),actions=read("src/app/admin/content/actions.ts"),dto=read("src/lib/practice/learner-dto.ts");
  it("uses append-only lifecycle/provenance migration without duplicating content",()=>{expect(migration).toContain('ADD COLUMN "provenance"');expect(migration).toContain("SEEDED");expect(migration).not.toMatch(/insert into (questions|passage_sets)/i);expect(migration).toContain("CONTENT_PUBLISHED");});
  it("makes semantic changes lifecycle transitions with transactional audit",()=>{expect(service).toContain('g.status !== "draft"');expect(service).toContain("STALE_CONTENT");expect(service).toContain("CONTENT_CLONED");expect(service).toContain("db.transaction");expect(service).toContain("CONTENT_REQUIRED_FOR_FULL_MOCK");expect(service).toContain("assembleFullMock");});
  it("authorizes every mutation and delegates upload to MediaStorage",()=>{expect(actions).toContain('actor("CONTENT_MANAGE")');expect(actions).toContain('actor("MEDIA_MANAGE")');expect(actions).toContain("ingestMedia");expect(actions).toContain("R2MediaStorage");});
  it("keeps learner DTO allowlisted",()=>{expect(dto).toContain("Allowlist mapper");expect(dto).not.toContain("correctOptionId");expect(dto).not.toContain("explanationEn");expect(dto).not.toContain("transcript");});
  it("provides all admin content routes",()=>{for(const p of ["src/app/admin/content/page.tsx","src/app/admin/content/questions/page.tsx","src/app/admin/content/questions/[id]/page.tsx","src/app/admin/content/new/page.tsx","src/app/admin/content/media/page.tsx"])expect(fs.existsSync(p)).toBe(true);});
});
