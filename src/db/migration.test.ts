import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();
beforeAll(async () => {
  const migration = readFileSync("drizzle/0000_lively_mordo.sql", "utf8");
  for (const statement of migration.split("--> statement-breakpoint").map((value) => value.trim()).filter(Boolean)) {
    await database.exec(statement);
  }
}, 30_000);
afterAll(async () => database.close());

describe("self-hosted PostgreSQL migration", () => {
  it("creates every auth and learning table", async () => {
    const result = await database.query<{ table_name: string }>("select table_name from information_schema.tables where table_schema = 'public'");
    const names = result.rows.map((row) => row.table_name);
    expect(names).toEqual(expect.arrayContaining(["users", "auth_identities", "user_sessions", "profiles", "email_verification_tokens", "password_reset_tokens", "account_activation_tokens", "passage_sets", "passages", "questions", "question_options", "question_solutions", "practice_sessions", "practice_session_questions", "attempt_answers", "demo_test_answers"]));
  });

  it("enforces normalized-email and provider identity uniqueness", async () => {
    await database.query("insert into users (id,email,email_normalized) values ('00000000-0000-4000-8000-000000000001','User@example.com','user@example.com')");
    await expect(database.query("insert into users (id,email,email_normalized) values ('00000000-0000-4000-8000-000000000002','USER@example.com','user@example.com')")).rejects.toThrow();
  });

  it("enforces session ownership and answer-option integrity", async () => {
    const constraints = await database.query<{ constraint_name: string }>("select constraint_name from information_schema.table_constraints where constraint_schema = 'public'");
    const names = constraints.rows.map((row) => row.constraint_name);
    expect(names).toEqual(expect.arrayContaining(["attempt_answers_session_user_fk", "attempt_answers_option_question_fk", "demo_answers_session_user_fk", "demo_answers_option_question_fk"]));
  });
});
