import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();
const userId = "10000000-0000-4000-8000-000000000001";
const groupId = "20000000-0000-4000-8000-000000000001";
const questionId = "30000000-0000-4000-8000-000000000001";

beforeAll(async () => {
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
  for (const entry of journal.entries) await database.exec(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
  await database.exec(`
    insert into users(id,email,email_normalized,status) values ('${userId}','reporter@example.test','reporter@example.test','active');
    insert into passage_sets(id,toeic_part,skill_area,set_type,title,status) values ('${groupId}',5,'READING','standalone','Report fixture','published');
    insert into questions(id,toeic_part,skill_area,question_type,skill,sub_skill,difficulty,question_text,status,passage_set_id)
      values ('${questionId}',5,'READING','standalone','grammar','verb_tense','easy','Fixture question','published','${groupId}');
  `);
}, 30_000);

afterAll(async () => database.close());

describe("Task 40 question report migration", () => {
  it("is additive and creates the indexed report workflow", async () => {
    const columns = await database.query<{ column_name: string }>("select column_name from information_schema.columns where table_name='question_reports'");
    expect(columns.rows.map((row) => row.column_name)).toEqual(expect.arrayContaining(["question_id", "practice_session_id", "reason", "status", "remediation_group_id", "resolution_note"]));
    const migration = readFileSync("drizzle/0045_question_reports.sql", "utf8");
    expect(migration).not.toMatch(/drop table|delete from (questions|attempt_answers)/i);
    expect(migration).toContain("question_reports_active_user_question_uidx");
    expect(migration).toContain("QUESTION_REPORT_CORRECTION_DRAFTED");
  });

  it("rejects duplicate active reports while allowing a later report after closure", async () => {
    await database.exec(`insert into question_reports(question_id,question_group_id,reporter_user_id,source_type,reason) values ('${questionId}','${groupId}','${userId}','PRACTICE','AMBIGUOUS')`);
    await expect(database.exec(`insert into question_reports(question_id,question_group_id,reporter_user_id,source_type,reason) values ('${questionId}','${groupId}','${userId}','PRACTICE','OTHER')`)).rejects.toThrow();
    await database.exec("update question_reports set status='DISMISSED',resolution_note='Reviewed and not reproducible',resolved_at=now() where question_id='" + questionId + "'");
    await database.exec(`insert into question_reports(question_id,question_group_id,reporter_user_id,source_type,reason) values ('${questionId}','${groupId}','${userId}','PRACTICE','OTHER')`);
  });

  it("enforces actor, category, length, and terminal-note integrity", async () => {
    await expect(database.exec(`insert into question_reports(question_id,source_type,reason) values ('${questionId}','PRACTICE','OTHER')`)).rejects.toThrow();
    await expect(database.exec(`insert into question_reports(question_id,guest_owner_hash,source_type,reason) values ('${questionId}','guest','PRACTICE','UNKNOWN')`)).rejects.toThrow();
    await expect(database.exec(`insert into question_reports(question_id,guest_owner_hash,source_type,reason,description) values ('${questionId}','guest','PRACTICE','OTHER',repeat('x',501))`)).rejects.toThrow();
    await expect(database.exec(`insert into question_reports(question_id,guest_owner_hash,source_type,reason,status) values ('${questionId}','guest','PRACTICE','OTHER','RESOLVED')`)).rejects.toThrow();
  });
});
