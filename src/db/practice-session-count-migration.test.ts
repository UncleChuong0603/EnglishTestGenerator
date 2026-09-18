import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();
const migrationPath = "drizzle/0011_practice_session_count_invariants.sql";

async function applyMigration() {
  const migration = readFileSync(migrationPath, "utf8");
  for (const statement of migration.split("--> statement-breakpoint").map((value) => value.trim()).filter(Boolean)) {
    await database.exec(statement);
  }
}

async function insertSession(values: {
  skillArea: "LISTENING" | "READING";
  practiceType: string;
  part: number | null;
  questionCount: number;
  source: string;
  requestedQuestionCount: number | null;
}) {
  return database.query(
    `insert into practice_sessions
      (skill_area, practice_type, part, question_count, source, requested_question_count)
     values ($1, $2, $3, $4, $5, $6)`,
    [values.skillArea, values.practiceType, values.part, values.questionCount, values.source, values.requestedQuestionCount],
  );
}

beforeAll(async () => {
  await database.exec(`
    create table practice_sessions (
      id bigint generated always as identity primary key,
      skill_area text not null,
      practice_type text not null,
      part smallint,
      question_count smallint not null,
      source text not null,
      requested_question_count smallint,
      constraint practice_sessions_count_check
        check (question_count between 1 and 100 and requested_question_count in (10,15,20,100)),
      constraint practice_sessions_owner_check check (skill_area in ('LISTENING','READING')),
      constraint practice_sessions_diagnostic_link_check check (source <> ''),
      constraint practice_sessions_full_mock_link_check check (source <> ''),
      constraint practice_sessions_demo_time_check check (source <> '')
    );
    insert into practice_sessions
      (skill_area, practice_type, part, question_count, source, requested_question_count)
    values ('READING', 'part_5', 5, 10, 'custom', 10);
  `);
  await applyMigration();
}, 30_000);

afterAll(async () => database.close());

describe("practice session count invariant migration", () => {
  it("is append-only and replaces only the obsolete count policy", async () => {
    const migration = readFileSync(migrationPath, "utf8");
    expect(migration).toContain('DROP CONSTRAINT IF EXISTS "practice_sessions_count_check"');
    expect(migration).toContain('"question_count" > 0');
    expect(migration).toContain('"requested_question_count" IS NULL');
    expect(migration).not.toMatch(/IN\s*\(\s*10\s*,\s*15\s*,\s*20/i);

    const result = await database.query<{ constraint_name: string }>(`
      select constraint_name
      from information_schema.table_constraints
      where table_name = 'practice_sessions' and constraint_type = 'CHECK'
    `);
    expect(result.rows.map((row) => row.constraint_name)).toEqual(expect.arrayContaining([
      "practice_sessions_count_check",
      "practice_sessions_owner_check",
      "practice_sessions_diagnostic_link_check",
      "practice_sessions_full_mock_link_check",
      "practice_sessions_demo_time_check",
    ]));
    await expect(database.query("select 1 from practice_sessions where practice_type = 'part_5'")).resolves.toBeDefined();
  });

  it.each(["recommended", "custom"])("accepts Listening Part 1 with five questions from %s", async (source) => {
    await expect(insertSession({
      skillArea: "LISTENING",
      practiceType: "listening_part_1",
      part: 1,
      questionCount: 5,
      source,
      requestedQuestionCount: 5,
    })).resolves.toBeDefined();
  });

  it.each([
    ["Listening Part 2", "LISTENING", "listening_part_2", 2, 5, "custom", 5],
    ["Listening Part 3 grouped", "LISTENING", "listening_part_3", 3, 9, "recommended", 9],
    ["Listening Part 4 grouped", "LISTENING", "listening_part_4", 4, 12, "custom", 12],
    ["Reading custom", "READING", "part_6", 6, 16, "custom", 15],
    ["Reading recommended", "READING", "part_7", 7, 20, "recommended", 20],
    ["guest", "READING", "mixed_reading", null, 10, "guest", 10],
    ["diagnostic child", "LISTENING", "listening_part_1", 1, 6, "diagnostic", 6],
    ["full mock child", "LISTENING", "full_mock_part_1", 1, 6, "full_mock", 6],
    ["mastery review", "READING", "part_5", 5, 7, "mastery_review", 5],
  ] as const)("accepts the current %s count shape", async (_name, skillArea, practiceType, part, questionCount, source, requestedQuestionCount) => {
    await expect(insertSession({ skillArea, practiceType, part, questionCount, source, requestedQuestionCount })).resolves.toBeDefined();
  });

  it.each([0, -1])("rejects question_count=%i", async (questionCount) => {
    await expect(insertSession({ skillArea: "READING", practiceType: "part_5", part: 5, questionCount, source: "custom", requestedQuestionCount: 10 })).rejects.toThrow();
  });

  it.each([0, -1])("rejects non-null requested_question_count=%i", async (requestedQuestionCount) => {
    await expect(insertSession({ skillArea: "READING", practiceType: "part_5", part: 5, questionCount: 10, source: "custom", requestedQuestionCount })).rejects.toThrow();
  });

  it("accepts a null requested count as allowed by the durable invariant", async () => {
    await expect(insertSession({ skillArea: "READING", practiceType: "part_5", part: 5, questionCount: 10, source: "custom", requestedQuestionCount: null })).resolves.toBeDefined();
  });
});
