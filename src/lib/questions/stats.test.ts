import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/db", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = new PGlite();
  return { db: drizzle(client), pool: client };
});

import { pool } from "@/db";
import { getPublishedQuestionBankStats } from "./stats";

const database = pool as unknown as PGlite;

beforeAll(async () => {
  await database.exec(`
    create table passage_sets (id uuid primary key, status text not null);
    create table questions (id uuid primary key, toeic_part smallint not null, status text not null, passage_set_id uuid);
    insert into passage_sets values
      ('00000000-0000-4000-8000-000000000001', 'published'),
      ('00000000-0000-4000-8000-000000000002', 'draft'),
      ('00000000-0000-4000-8000-000000000003', 'archived');
    insert into questions values
      ('00000000-0000-4000-8000-000000000011', 5, 'published', null),
      ('00000000-0000-4000-8000-000000000012', 5, 'published', '00000000-0000-4000-8000-000000000001'),
      ('00000000-0000-4000-8000-000000000013', 5, 'draft', '00000000-0000-4000-8000-000000000001'),
      ('00000000-0000-4000-8000-000000000014', 6, 'published', '00000000-0000-4000-8000-000000000002'),
      ('00000000-0000-4000-8000-000000000015', 7, 'published', '00000000-0000-4000-8000-000000000003');
  `);
});

afterAll(async () => database.close());

describe("published question bank stats", () => {
  it("reads current published inventory and reflects later publication", async () => {
    expect(await getPublishedQuestionBankStats()).toEqual({ byPart: { 5: 2 }, total: 2 });

    await database.exec(`
      update passage_sets set status = 'published' where id = '00000000-0000-4000-8000-000000000002';
      update questions set status = 'published' where id = '00000000-0000-4000-8000-000000000013';
    `);
    expect(await getPublishedQuestionBankStats()).toEqual({ byPart: { 5: 3, 6: 1 }, total: 4 });

    await database.exec("update passage_sets set status = 'archived' where id = '00000000-0000-4000-8000-000000000001'");
    expect(await getPublishedQuestionBankStats()).toEqual({ byPart: { 5: 1, 6: 1 }, total: 2 });
  });
});
