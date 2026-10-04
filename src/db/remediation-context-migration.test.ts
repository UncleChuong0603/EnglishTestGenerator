import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();

beforeAll(async () => {
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
  for (const entry of journal.entries) await database.exec(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
}, 30_000);
afterAll(async () => database.close());

describe("Task 46 remediation context migration", () => {
  it("adds an additive trace table without duplicating mastery", async () => {
    const tables = await database.query<{ table_name: string }>("select table_name from information_schema.tables where table_schema='public'");
    expect(tables.rows.map((row) => row.table_name)).toContain("remediation_session_contexts");
    const migration = readFileSync("drizzle/0051_task46_remediation_context.sql", "utf8");
    expect(migration).toContain("remediation_context_user_question_idx");
    expect(migration).not.toContain('REFERENCES "public"."question_mastery"');
    expect(migration).not.toMatch(/drop table|delete from|update question_mastery/i);
  });
});
