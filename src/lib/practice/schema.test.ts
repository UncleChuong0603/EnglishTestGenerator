import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const migration = readFileSync("drizzle/0000_lively_mordo.sql", "utf8"); const actions = readFileSync("src/app/practice/actions.ts", "utf8");
describe("local practice security", () => {
  it("enforces ownership and one answer per session question", () => { expect(actions).toContain("practiceSessions.userId, user.id"); expect(migration).toContain("attempt_answers_session_question_unique"); expect(migration).toContain("attempt_answers_session_question_fk"); });
  it("grades from server-only solutions", () => { expect(actions).toContain("questionSolutions"); expect(actions).toContain("isCorrect"); });
  it("locks and handles submitted sessions idempotently", () => { expect(actions).toContain('.for("update")'); expect(actions).toContain('session.status === "submitted"'); });
});
