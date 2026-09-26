import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();

beforeAll(async () => {
  await database.exec(`
    create table content_posts (
      id text primary key,
      status text not null,
      constraint content_posts_status_check
        check (status in ('DRAFT', 'PUBLISHED', 'UNPUBLISHED'))
    );
    insert into content_posts (id, status) values ('existing-post', 'PUBLISHED');
  `);
  const migration = readFileSync("drizzle/0042_modern_jocasta.sql", "utf8");
  for (const statement of migration.split("--> statement-breakpoint").map(value => value.trim()).filter(Boolean)) {
    await database.exec(statement);
  }
});

afterAll(async () => database.close());

describe("SEO publication migration", () => {
  it("preserves existing posts and assigns a truthful migrated origin", async () => {
    const result = await database.query<{ status: string; content_origin: string }>(
      "select status, content_origin from content_posts where id = 'existing-post'",
    );
    expect(result.rows).toEqual([{ status: "PUBLISHED", content_origin: "MIGRATED" }]);
  });

  it("allows an archive redirect and rejects invalid origins", async () => {
    await database.exec("update content_posts set status='ARCHIVED', redirect_path='/toeic/part-5' where id='existing-post'");
    const result = await database.query<{ redirect_path: string }>(
      "select redirect_path from content_posts where id='existing-post'",
    );
    expect(result.rows[0].redirect_path).toBe("/toeic/part-5");
    await expect(database.exec("update content_posts set content_origin='UNKNOWN' where id='existing-post'")).rejects.toThrow();
  });
});
