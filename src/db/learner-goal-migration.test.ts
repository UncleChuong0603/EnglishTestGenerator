import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();
beforeAll(async () => {
  await database.exec("create table users (id uuid primary key default gen_random_uuid())");
  const migration = readFileSync("drizzle/0028_learner_goal_profile.sql", "utf8");
  for (const statement of migration.split("--> statement-breakpoint").map(value => value.trim()).filter(Boolean)) await database.exec(statement);
});
afterAll(async () => database.close());

describe("learner goal migration", () => {
  it("creates an optional one-to-one learner goal without backfill", async () => {
    const user = await database.query<{ id: string }>("insert into users default values returning id");
    expect((await database.query("select * from learner_goals")).rows).toHaveLength(0);
    await database.query("insert into learner_goals(user_id,target_score,exam_date,daily_study_minutes,study_days_per_week) values ($1,750,'2026-12-20',20,5)", [user.rows[0].id]);
    expect((await database.query("select * from learner_goals")).rows).toHaveLength(1);
  });
  it("enforces authoritative database constraints", async () => {
    const user = await database.query<{ id: string }>("insert into users default values returning id");
    await expect(database.query("insert into learner_goals(user_id,target_score) values ($1,752)", [user.rows[0].id])).rejects.toThrow();
    await expect(database.query("insert into learner_goals(user_id,daily_study_minutes) values ($1,25)", [user.rows[0].id])).rejects.toThrow();
    await expect(database.query("insert into learner_goals(user_id,study_days_per_week) values ($1,4)", [user.rows[0].id])).rejects.toThrow();
  });
  it("updates one goal and clears the optional exam date", async () => {
    const user = await database.query<{ id: string }>("insert into users default values returning id");
    await database.query("insert into learner_goals(user_id,target_score,exam_date) values ($1,650,'2026-12-20')", [user.rows[0].id]);
    await database.query("update learner_goals set target_score=750, exam_date=null where user_id=$1", [user.rows[0].id]);
    const result = await database.query<{ target_score: number; exam_date: string | null }>("select target_score,exam_date from learner_goals where user_id=$1", [user.rows[0].id]);
    expect(result.rows[0]).toMatchObject({ target_score: 750, exam_date: null });
  });
});
