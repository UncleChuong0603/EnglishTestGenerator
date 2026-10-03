import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();

beforeAll(async () => {
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
  for (const entry of journal.entries) await database.exec(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
}, 30_000);

afterAll(async () => database.close());

describe("question issue reports migration", () => {
  it("keeps journal timestamps ordered and migration numbers unique", () => {
    const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8")) as { entries: Array<{ idx: number; tag: string; when: number }> };
    expect(journal.entries.map((entry) => entry.idx)).toEqual(journal.entries.map((_, index) => index));
    for (let index = 1; index < journal.entries.length; index += 1) {
      expect(journal.entries[index].when).toBeGreaterThan(journal.entries[index - 1].when);
    }
    const prefixes = readdirSync("drizzle").filter((file) => /^\d{4}_.+\.sql$/.test(file)).map((file) => file.slice(0, 4));
    expect(new Set(prefixes).size).toBe(prefixes.length);
    expect(journal.entries.at(-1)?.tag).toBe("0050_task45_mistake_reasons");
  });

  it("stores one durable system report for each detected pair", async () => {
    const first = crypto.randomUUID();
    const second = crypto.randomUUID();
    await database.exec(`
      insert into passage_sets(id,toeic_part,skill_area,set_type,title)
      values ('${first}',5,'READING','standalone','First'),('${second}',5,'READING','standalone','Second');
      insert into question_issue_reports(fingerprint,issue_type,toeic_part,primary_group_id,related_group_id,confidence_percent)
      values ('pair-1','DUPLICATE',5,'${first}','${second}',92);
    `);
    const result = await database.query<{ status: string; source: string; confidence_percent: number }>("select status,source,confidence_percent from question_issue_reports where fingerprint='pair-1'");
    expect(result.rows).toEqual([{ status: "OPEN", source: "SYSTEM", confidence_percent: 92 }]);
    await expect(database.exec(`insert into question_issue_reports(fingerprint,issue_type,toeic_part,primary_group_id,related_group_id) values ('pair-1','DUPLICATE',5,'${first}','${second}')`)).rejects.toThrow();
  });

  it("rejects invalid workflow states and incomplete duplicate evidence", async () => {
    const first = crypto.randomUUID();
    await database.exec(`insert into passage_sets(id,toeic_part,skill_area,set_type,title) values ('${first}',5,'READING','standalone','Only')`);
    await expect(database.exec(`insert into question_issue_reports(fingerprint,issue_type,status,toeic_part,primary_group_id) values ('bad-status','OTHER','WAITING',5,'${first}')`)).rejects.toThrow();
    await expect(database.exec(`insert into question_issue_reports(fingerprint,issue_type,toeic_part,primary_group_id) values ('missing-pair','DUPLICATE',5,'${first}')`)).rejects.toThrow();
  });
});
