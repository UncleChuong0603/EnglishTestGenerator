import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/db", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = new PGlite();
  return { db: drizzle(client), pool: client };
});

import { db, pool } from "@/db";
import { passageSets, questions, questionOptions, questionSolutions, questionIssueReports } from "@/db/schema";
import { findSimilarContent } from "./content";
import { duplicateReportFingerprint, listQuestionIssueReports, syncDuplicateQuestionReports, updateQuestionIssueReportStatus } from "./question-issue-reports";

const database = pool as unknown as PGlite;
const ADMIN = "10000000-0000-4000-8000-000000000001";
const LEARNER = "10000000-0000-4000-8000-000000000002";
const original = "When will the marketing team submit the quarterly report?";

beforeAll(async () => {
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8")) as { entries: Array<{ tag: string }> };
  for (const entry of journal.entries) await database.exec(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
  await database.exec(`insert into users(id,email,email_normalized,status) values
    ('${ADMIN}','admin@reports.invalid','admin@reports.invalid','active'),
    ('${LEARNER}','learner@reports.invalid','learner@reports.invalid','active');
    insert into user_roles(user_id,role) values ('${ADMIN}','ADMIN');`);
}, 60_000);

beforeEach(async () => {
  await database.exec("delete from question_issue_reports; delete from question_duplicate_scans; delete from question_solutions; delete from question_options; delete from questions; delete from passages; delete from listening_transcripts; delete from passage_sets; delete from admin_audit_logs; delete from question_bank_settings;");
});
afterAll(async () => database.close());

async function group(text = original, part = 5, optionTexts = ["Friday afternoon", "Inside a folder", "By train", "With Ms Lane"]) {
  const [item] = await db.insert(passageSets).values({ toeicPart: part, skillArea: part <= 4 ? "LISTENING" : "READING", setType: part === 2 ? "question_response" : "standalone", title: text }).returning();
  const [question] = await db.insert(questions).values({ toeicPart: part, skillArea: part <= 4 ? "LISTENING" : "READING", questionType: "standalone", skill: "grammar", subSkill: "verb", difficulty: "easy", questionText: text, passageSetId: item.id }).returning();
  const options = await db.insert(questionOptions).values(optionTexts.map((optionText, index) => ({ questionId: question.id, optionKey: String.fromCharCode(65 + index), optionText, displayOrder: index + 1 }))).returning();
  await db.insert(questionSolutions).values({ questionId: question.id, correctOptionId: options[0].id, explanationEn: "The first response answers the question." });
  return { id: item.id, questionId: question.id };
}

describe("automatic duplicate reports", () => {
  it("detects exact and near matches, excludes other Parts/archived groups and skips unchanged scans", async () => {
    const left = await group();
    const right = await group();
    await group("When will the marketing team submit its quarterly report?");
    await group("Where should visitors leave umbrellas?", 5, ["Reception desk", "Nine o'clock", "Software update", "Two tickets"]);
    const archived = await group();
    await database.query("update passage_sets set status='archived' where id=$1", [archived.id]);
    await group(original, 2);
    const first = await syncDuplicateQuestionReports(5);
    expect(first).toMatchObject({ scanned: 4, detected: 3 });
    const result = await listQuestionIssueReports({ status: "OPEN" });
    expect(result.total).toBe(3);
    const exact = result.rows.find((row) => row.evidence.exact === true)!;
    expect(exact).toMatchObject({ source: "SYSTEM", issueType: "DUPLICATE", status: "OPEN", confidencePercent: 100 });
    expect([exact.primary.id, exact.related?.id].sort()).toEqual([left.id, right.id].sort());
    expect(duplicateReportFingerprint(left.id, right.id)).toBe(duplicateReportFingerprint(right.id, left.id));
    const second = await syncDuplicateQuestionReports(5);
    expect(second.scannedAt).toEqual(first.scannedAt);
    expect((await db.select().from(questionIssueReports))).toHaveLength(3);
    const scan = await findSimilarContent(5, { activeOnly: true });
    expect((await findSimilarContent(5, { activeOnly: true, contentVersion: scan.contentVersion })).unchanged).toBe(true);
  });

  it("auto-closes disappearing matches and reopens only system-resolved reports", async () => {
    const left = await group();
    await group();
    await syncDuplicateQuestionReports(5);
    const report = (await listQuestionIssueReports({})).rows[0];
    await updateQuestionIssueReportStatus(ADMIN, report.id, "IN_REVIEW", "OPEN");
    await database.query("update passage_sets set status='archived' where id=$1", [left.id]);
    await syncDuplicateQuestionReports(5);
    expect((await listQuestionIssueReports({ status: "RESOLVED" })).rows[0]).toMatchObject({ id: report.id, evidence: { autoResolved: true } });
    await database.query("update passage_sets set status='draft' where id=$1", [left.id]);
    await syncDuplicateQuestionReports(5);
    expect((await listQuestionIssueReports({ status: "OPEN" })).rows[0].id).toBe(report.id);
    await updateQuestionIssueReportStatus(ADMIN, report.id, "DISMISSED", "OPEN");
    await database.query("update questions set question_text=question_text || ' Tomorrow' where id=$1", [left.questionId]);
    await syncDuplicateQuestionReports(5);
    expect((await listQuestionIssueReports({ status: "DISMISSED" })).rows[0].id).toBe(report.id);
    expect((await listQuestionIssueReports({ status: "OPEN" })).total).toBe(0);
    const audit = await database.query<{ action: string }>("select action from admin_audit_logs order by created_at");
    expect(audit.rows.map((row) => row.action)).toEqual(["QUESTION_REPORT_STATUS_UPDATED", "QUESTION_REPORT_STATUS_UPDATED"]);
  });

  it("rejects unauthorized and stale reviews without changing the report", async () => {
    await group(); await group(); await syncDuplicateQuestionReports(5);
    const report = (await listQuestionIssueReports({})).rows[0];
    await expect(updateQuestionIssueReportStatus(LEARNER, report.id, "DISMISSED", "OPEN")).rejects.toThrow("ACCESS_DENIED");
    await updateQuestionIssueReportStatus(ADMIN, report.id, "IN_REVIEW", "OPEN");
    await expect(updateQuestionIssueReportStatus(ADMIN, report.id, "DISMISSED", "OPEN")).rejects.toThrow("STALE_REPORT");
    expect((await listQuestionIssueReports({})).rows[0].status).toBe("IN_REVIEW");
  });

  it("preserves a human resolution after content changes and reviewer removal", async () => {
    const left = await group(); await group(); await syncDuplicateQuestionReports(5);
    const report = (await listQuestionIssueReports({})).rows[0];
    await updateQuestionIssueReportStatus(ADMIN, report.id, "RESOLVED", "OPEN");
    // A removed reviewer must not make a human decision look system-resolved.
    await database.query("update question_issue_reports set resolved_by=null where id=$1", [report.id]);
    await database.query("update passage_sets set status='archived' where id=$1", [left.id]);
    await syncDuplicateQuestionReports(5);
    await database.query("update passage_sets set status='draft' where id=$1", [left.id]);
    await syncDuplicateQuestionReports(5);
    expect((await listQuestionIssueReports({})).rows[0]).toMatchObject({ id: report.id, status: "RESOLVED", evidence: { autoResolved: false } });
  });

  it("rolls back report updates and scan state together when persistence fails", async () => {
    await group(); await group(); const first = await syncDuplicateQuestionReports(5);
    await group();
    await database.exec(`create function fail_duplicate_scan() returns trigger language plpgsql as $$ begin raise exception 'TEST_SCAN_FAILURE'; end $$;
      create trigger fail_duplicate_scan before insert or update on question_duplicate_scans for each row execute function fail_duplicate_scan();`);
    try {
      await expect(syncDuplicateQuestionReports(5)).rejects.toThrow();
      expect((await listQuestionIssueReports({})).total).toBe(1);
      expect((await database.query<{ scanned_count: number }>("select scanned_count from question_duplicate_scans where toeic_part=5")).rows[0].scanned_count).toBe(first.scanned);
    } finally {
      await database.exec("drop trigger fail_duplicate_scan on question_duplicate_scans; drop function fail_duplicate_scan();");
    }
    expect((await syncDuplicateQuestionReports(5)).detected).toBe(3);
  });

  it("rescans when only options or the threshold change and never edits content", async () => {
    await group(); const right = await group(); await syncDuplicateQuestionReports(5);
    const before = (await listQuestionIssueReports({})).rows[0];
    await database.query("update question_options set option_text='Saturday afternoon' where question_id=$1 and option_key='A'", [right.questionId]);
    await syncDuplicateQuestionReports(5);
    const changed = (await listQuestionIssueReports({})).rows[0];
    expect(changed.evidence.exact).toBe(false);
    await database.exec("insert into question_bank_settings(id,similarity_threshold_percent) values ('default',95)");
    await syncDuplicateQuestionReports(5);
    expect((await listQuestionIssueReports({ status: "OPEN" })).total).toBe(0);
    expect((await listQuestionIssueReports({ status: "RESOLVED" })).rows[0].id).toBe(before.id);
    expect((await database.query<{ text: string; status: string }>("select question_text as text,status from questions where id=$1", [right.questionId])).rows[0]).toEqual({ text: original, status: "draft" });
  });

  it("paginates mixed report types and applies Part/type/status filters", async () => {
    const item = await group();
    await db.insert(questionIssueReports).values(Array.from({ length: 23 }, (_, index) => ({ fingerprint: `learner-${index}`, source: "LEARNER", issueType: "ANSWER_ERROR", toeicPart: 5, primaryGroupId: item.id, status: index === 22 ? "IN_REVIEW" : "OPEN" })));
    expect((await listQuestionIssueReports({ part: 5, issueType: "ANSWER_ERROR", status: "OPEN" })).rows).toHaveLength(20);
    const next = await listQuestionIssueReports({ part: 5, issueType: "ANSWER_ERROR", status: "OPEN", page: 2 });
    expect(next).toMatchObject({ total: 22, counts: { OPEN: 22, IN_REVIEW: 1 } });
    expect(next.rows).toHaveLength(2);
    expect((await listQuestionIssueReports({ issueType: "DUPLICATE" })).total).toBe(0);
    expect((await listQuestionIssueReports({ part: 2 })).total).toBe(0);
  });
});
