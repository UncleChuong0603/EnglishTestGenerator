import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();
beforeAll(async () => {
  await database.exec("create table users (id uuid primary key default gen_random_uuid())");
  const migration = readFileSync("drizzle/0025_product_analytics.sql", "utf8");
  for (const statement of migration.split("--> statement-breakpoint").map(value => value.trim()).filter(Boolean)) await database.exec(statement);
});
afterAll(async () => database.close());

describe("product analytics migration", () => {
  it("creates the append-only event table and indexes", async () => {
    const tables = await database.query<{ table_name: string }>("select table_name from information_schema.tables where table_schema='public'");
    expect(tables.rows.map(row => row.table_name)).toContain("product_events");
    const indexes = await database.query<{ indexname: string }>("select indexname from pg_indexes where tablename='product_events'");
    expect(indexes.rows.map(row => row.indexname)).toEqual(expect.arrayContaining(["product_events_name_occurred_idx", "product_events_dedup_uidx"]));
  });
  it("rejects unsupported events and duplicate deduplication keys", async () => {
    await expect(database.exec("insert into product_events(event_name) values ('unsupported')")).rejects.toThrow();
    await database.exec("insert into product_events(event_name,deduplication_key) values ('landing_viewed','same-key')");
    await expect(database.exec("insert into product_events(event_name,deduplication_key) values ('landing_viewed','same-key')")).rejects.toThrow();
  });
  it("adds challenge events without removing older events", async () => {
    const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8")) as { entries: Array<{ tag: string; when: number }> };
    const previous = journal.entries.find(entry => entry.tag === "0033_question_bank_scale");
    const current = journal.entries.find(entry => entry.tag === "0034_square_tinkerer");
    expect(current?.when).toBeGreaterThan(previous!.when);
    const migration = readFileSync("drizzle/0034_square_tinkerer.sql", "utf8");
    for (const statement of migration.split("--> statement-breakpoint").map(value => value.trim()).filter(Boolean)) await database.exec(statement);
    await database.exec("insert into product_events(event_name,deduplication_key) values ('challenge_viewed','challenge-view-1')");
    await database.exec("insert into product_events(event_name,deduplication_key) values ('first_authenticated_workout_after_challenge','challenge-workout-1')");
    await database.exec("insert into product_events(event_name,deduplication_key) values ('landing_viewed','old-event-1')");
    await expect(database.exec("insert into product_events(event_name,deduplication_key) values ('challenge_viewed','challenge-view-1')")).rejects.toThrow();
    expect((await database.query("select count(*)::int n from product_events")).rows[0]).toEqual({ n: 4 });
  });
});
