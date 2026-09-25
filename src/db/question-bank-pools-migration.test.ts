import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();

beforeAll(async () => {
  await database.exec(`
    create table questions (
      id uuid primary key,
      toeic_part smallint not null,
      status text not null
    );
    create table full_mock_form_questions (
      form_number smallint not null,
      position smallint not null,
      question_id uuid not null references questions(id)
    );
    insert into questions values
      ('10000000-0000-4000-8000-000000000001',5,'published'),
      ('10000000-0000-4000-8000-000000000002',5,'draft');
    insert into full_mock_form_questions values
      (1,1,'10000000-0000-4000-8000-000000000001');
  `);
  const migration = readFileSync("drizzle/0039_wise_gauntlet.sql", "utf8");
  for (const statement of migration.split("--> statement-breakpoint").map((value) => value.trim()).filter(Boolean)) {
    await database.exec(statement);
  }
});

afterAll(async () => database.close());

describe("question bank pool migration", () => {
  it("keeps mapped mock questions and defaults new questions to practice", async () => {
    const before = await database.query<{ id: string; bank_pool: string }>("select id,bank_pool from questions order by id");
    expect(before.rows.map((row) => row.bank_pool)).toEqual(["MOCK", "PRACTICE"]);
    await database.exec("insert into questions(id,toeic_part,status) values ('10000000-0000-4000-8000-000000000003',2,'draft')");
    const after = await database.query<{ bank_pool: string }>("select bank_pool from questions where id='10000000-0000-4000-8000-000000000003'");
    expect(after.rows[0].bank_pool).toBe("PRACTICE");
  });

  it("rejects unknown pool names", async () => {
    await expect(database.exec("update questions set bank_pool='SHARED' where id='10000000-0000-4000-8000-000000000002'")).rejects.toThrow();
  });
});
