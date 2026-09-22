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
      constraint admin_audit_logs_action_check check (action in ('QUESTION_BANK_BLUEPRINT_UPDATED'))
    );
    create table question_bank_settings (
      id text primary key default 'default',
      target_forms smallint not null default 10,
      updated_by uuid references users(id),
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now(),
      constraint question_bank_settings_singleton_check check (id = 'default'),
      constraint question_bank_settings_target_forms_check check (target_forms between 1 and 100)
    );
  `);
  const migration = readFileSync("drizzle/0031_good_blur.sql", "utf8");
  for (const statement of migration.split("--> statement-breakpoint").map((value) => value.trim()).filter(Boolean)) {
    await database.exec(statement);
  }
});

afterAll(async () => database.close());

describe("admin operational settings migration", () => {
  it("adds bounded defaults for content quality and support", async () => {
    await database.exec("insert into question_bank_settings default values");
    const result = await database.query<{ similarity_threshold_percent: number; support_response_target_hours: number }>(
      "select similarity_threshold_percent,support_response_target_hours from question_bank_settings",
    );
    expect(result.rows[0]).toEqual({ similarity_threshold_percent: 58, support_response_target_hours: 24 });
    await expect(database.exec("update question_bank_settings set similarity_threshold_percent=24")).rejects.toThrow();
    await expect(database.exec("update question_bank_settings set support_response_target_hours=169")).rejects.toThrow();
  });

  it("accepts both new audit actions", async () => {
    await database.exec("insert into admin_audit_logs(action) values ('CONTENT_QUALITY_SETTINGS_UPDATED'),('SUPPORT_SETTINGS_UPDATED')");
    await expect(database.exec("insert into admin_audit_logs(action) values ('UNSAFE')")).rejects.toThrow();
  });
});
