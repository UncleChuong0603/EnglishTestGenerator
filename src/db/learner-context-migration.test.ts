import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();
beforeAll(async () => {
  await database.exec("create table users (id uuid primary key default gen_random_uuid())");
  const migration = readFileSync("drizzle/0032_sad_onslaught.sql", "utf8");
  for (const statement of migration.split("--> statement-breakpoint").map(value => value.trim()).filter(Boolean)) await database.exec(statement.replace('REFERENCES "public"."users"', 'REFERENCES "users"'));
});
afterAll(async () => database.close());

describe("learner context migration", () => {
  it("is optional, one-to-one, and supports partial values", async () => {
    const users = await database.query<{ id: string }>("insert into users default values returning id"); const id = users.rows[0].id;
    expect((await database.query("select * from learner_contexts")).rows).toHaveLength(0);
    await database.query("insert into learner_contexts(user_id,study_purpose) values ($1,'JOB_CAREER')", [id]);
    await expect(database.query("insert into learner_contexts(user_id) values ($1)", [id])).rejects.toThrow();
  });
  it("enforces values, length, and stale OTHER consistency", async () => {
    const users = await database.query<{ id: string }>("insert into users default values returning id"); const id = users.rows[0].id;
    await expect(database.query("insert into learner_contexts(user_id,study_purpose) values ($1,'FAKE')", [id])).rejects.toThrow();
    await expect(database.query("insert into learner_contexts(user_id,study_purpose,study_purpose_other) values ($1,'JOB_CAREER','stale')", [id])).rejects.toThrow();
    await expect(database.query("insert into learner_contexts(user_id,acquisition_source,acquisition_source_other) values ($1,'OTHER',$2)", [id, "x".repeat(121)])).rejects.toThrow();
  });
});
