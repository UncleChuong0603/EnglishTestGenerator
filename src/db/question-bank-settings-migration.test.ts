import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();

beforeAll(async () => {
  await database.exec(`
    create table users (id uuid primary key default gen_random_uuid());
    create table admin_audit_logs (
      id uuid primary key default gen_random_uuid(),
      actor_user_id uuid references users(id),
      action text not null,
      target_user_id uuid references users(id),
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamp with time zone not null default now(),
      constraint admin_audit_logs_action_check check (action in ('ADMIN_ROLE_GRANTED'))
    );
  `);
  const migration = readFileSync("drizzle/0029_question_bank_settings.sql", "utf8");
  for (const statement of migration.split("--> statement-breakpoint").map((value) => value.trim()).filter(Boolean)) {
    await database.exec(statement);
  }
});

afterAll(async () => database.close());

describe("question bank settings migration", () => {
  it("stores one bounded blueprint target", async () => {
    await database.exec("insert into question_bank_settings default values");
    const result = await database.query<{ id: string; target_forms: number }>("select id,target_forms from question_bank_settings");
    expect(result.rows[0]).toEqual({ id: "default", target_forms: 10 });
    await expect(database.exec("insert into question_bank_settings(id,target_forms) values ('other',0)")).rejects.toThrow();
  });

  it("accepts the blueprint audit action", async () => {
    await database.exec("insert into admin_audit_logs(action) values ('QUESTION_BANK_BLUEPRINT_UPDATED')");
    await expect(database.exec("insert into admin_audit_logs(action) values ('UNSAFE')")).rejects.toThrow();
  });
});
