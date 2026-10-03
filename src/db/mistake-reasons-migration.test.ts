import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();

beforeAll(async () => {
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
  for (const entry of journal.entries) await database.exec(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
}, 30_000);

afterAll(async () => database.close());

describe("Task 45 mistake reason migration", () => {
  it("is additive and enforces stable codes and evidence sources", async () => {
    const migration = readFileSync("drizzle/0050_task45_mistake_reasons.sql", "utf8");
    expect(migration).toContain("mistake_reason_user_attempt_unique");
    expect(migration).toContain("USER_SELECTED");
    expect(migration).toContain("SYSTEM_INFERRED");
    expect(migration).toContain("SYSTEM_SUGGESTED");
    expect(migration).not.toMatch(/drop table|truncate|delete from|alter column/i);
    const tables = await database.query<{ table_name: string }>("select table_name from information_schema.tables where table_schema='public'");
    expect(tables.rows.map((row) => row.table_name)).toContain("mistake_reason_classifications");
  });
});
