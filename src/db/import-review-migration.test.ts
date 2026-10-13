import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";

const database = new PGlite();

describe("import review audit migration", () => {
  beforeAll(async () => {
    await database.exec(`
      create table admin_audit_logs (
        action text not null,
        constraint admin_audit_logs_action_check check (action in ('IMPORT_COMMITTED'))
      );
    `);
    const migration = fs.readFileSync("drizzle/0057_import_review_audit.sql", "utf8")
      .replaceAll("--> statement-breakpoint", "");
    await database.exec(migration);
  }, 30_000);

  afterAll(async () => database.close());

  it("accepts the human-review decision while preserving the action allowlist", async () => {
    await database.exec("insert into admin_audit_logs(action) values ('IMPORT_COMMITTED'),('IMPORT_REVIEW_COMPLETED')");
    await expect(database.exec("insert into admin_audit_logs(action) values ('UNSAFE')")).rejects.toThrow();
  });
});
