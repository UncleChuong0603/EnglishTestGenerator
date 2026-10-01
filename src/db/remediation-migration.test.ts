import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();

beforeAll(async () => {
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
  for (const entry of journal.entries) {
    await database.exec(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
  }
}, 30_000);

afterAll(async () => database.close());

describe("Task 41 remediation migration", () => {
  it("adds only the evidence mapping needed by the existing mastery model", async () => {
    const columns = await database.query<{ column_name: string }>(
      "select column_name from information_schema.columns where table_name='practice_session_questions'",
    );
    expect(columns.rows.map((row) => row.column_name)).toContain("mastery_target_question_id");

    const migration = readFileSync("drizzle/0046_task41_learning_remediation.sql", "utf8");
    expect(migration).toContain("practice_session_questions_mastery_target_idx");
    expect(migration).toContain('REFERENCES "public"."questions"("id")');
    expect(migration).not.toMatch(/drop table|delete from|update question_mastery/i);
  });
});
