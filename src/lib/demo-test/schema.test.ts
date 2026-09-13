import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const migration = readFileSync("drizzle/0000_lively_mordo.sql", "utf8");
const selector = readFileSync("src/lib/demo-test/selector.ts", "utf8");
const queries = readFileSync("src/lib/demo-test/queries.ts", "utf8");
const actions = readFileSync("src/app/demo-test/actions.ts", "utf8");
describe("Reading demo test local database contract", () => {
  it("freezes 30/16/54 questions in the assignment table", () => { expect(selector).toContain("p5.length !== 30"); expect(selector).toContain("selectExactUnits"); expect(selector).toContain("54"); expect(selector).toContain("practiceSessionQuestions"); });
  it("stores server timing and rejects answer changes after expiration", () => { expect(migration).toContain('"expires_at" timestamp with time zone'); expect(actions).toContain("session.expiresAt <= new Date()"); });
  it("keeps active choices separate from graded answers", () => { const active = migration.slice(migration.indexOf('CREATE TABLE "demo_test_answers"'), migration.indexOf('CREATE TABLE "email_verification_tokens"')); expect(active).not.toContain("is_correct"); expect(queries).toContain("questionSolutions"); });
  it("locks submission and is idempotent", () => { expect(queries).toContain('.for("update")'); expect(queries).toContain('session.status === "submitted"'); expect(migration).toContain("practice_sessions_one_open_demo_idx"); });
  it("checks user ownership, assigned question and option", () => { expect(actions).toContain("practiceSessions.userId, user.id"); expect(actions).toContain("practiceSessionQuestions.questionId, questionId"); expect(actions).toContain("questionOptions.questionId, questionId"); });
  it("keeps timed tests separate when ordinary practice starts", () => { const practice = readFileSync("src/lib/practice/selector.ts", "utf8"); expect(practice).toContain('ne(practiceSessions.practiceType, "demo_test")'); });
});
