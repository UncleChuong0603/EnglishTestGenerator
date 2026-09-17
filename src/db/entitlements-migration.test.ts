import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();
beforeAll(async () => { for (let index = 0; index <= 8; index++) { const name = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8")).entries[index].tag; await database.exec(readFileSync(`drizzle/${name}.sql`, "utf8")); } }, 30_000);
afterAll(async () => database.close());

describe("Task 13 migration", () => {
  it("creates membership and usage tables", async () => { const result = await database.query<{ table_name: string }>("select table_name from information_schema.tables where table_schema='public'"); expect(result.rows.map((row) => row.table_name)).toEqual(expect.arrayContaining(["user_plan_memberships", "usage_consumptions"])); });
  it("enforces plan and positive usage constraints", async () => { await database.exec("insert into users (id,email,email_normalized,status) values ('10000000-0000-4000-8000-000000000001','quota@example.com','quota@example.com','active')"); await expect(database.exec("insert into user_plan_memberships (user_id,plan_key,source,starts_at) values ('10000000-0000-4000-8000-000000000001','FREE','MANUAL',now())")).rejects.toThrow(); await expect(database.exec("insert into usage_consumptions (user_id,entitlement_key,source_type,source_id,quantity) values ('10000000-0000-4000-8000-000000000001','MANUAL_PRACTICE','PRACTICE_SESSION','20000000-0000-4000-8000-000000000001',0)")).rejects.toThrow(); });
});
