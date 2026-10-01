import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();

beforeAll(async () => {
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
  for (const entry of journal.entries) await database.exec(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
}, 30_000);

afterAll(async () => database.close());

describe("question issue reports migration", () => {
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
