import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();

beforeAll(async () => {
  await database.exec(`
    create table profiles (
      id uuid primary key default gen_random_uuid(),
      ranking_visibility text not null default 'ANONYMOUS',
      updated_at timestamp with time zone not null default now()
    );
    insert into profiles (ranking_visibility) values ('ANONYMOUS'), ('PUBLIC'), ('HIDDEN');
  `);

  const migration = readFileSync("drizzle/0056_ranking_visibility_public.sql", "utf8");
  for (const statement of migration.split("--> statement-breakpoint").map((value) => value.trim()).filter(Boolean)) {
    await database.exec(statement);
  }
});

afterAll(async () => database.close());

describe("ranking visibility public migration", () => {
  it("moves profiles on the former anonymous default to public without unhiding hidden profiles", async () => {
    const result = await database.query<{ ranking_visibility: string; total: number }>(`
      select ranking_visibility, count(*)::int total
      from profiles
      group by ranking_visibility
      order by ranking_visibility
    `);

    expect(result.rows).toEqual([
      { ranking_visibility: "HIDDEN", total: 1 },
      { ranking_visibility: "PUBLIC", total: 2 },
    ]);
  });

  it("uses public visibility for newly created profiles", async () => {
    const result = await database.query<{ ranking_visibility: string }>(`
      insert into profiles default values
      returning ranking_visibility
    `);

    expect(result.rows[0]?.ranking_visibility).toBe("PUBLIC");
  });
});
