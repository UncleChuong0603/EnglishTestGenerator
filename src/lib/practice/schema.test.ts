import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const migration = readFileSync("drizzle/0000_lively_mordo.sql", "utf8"); const actions = readFileSync("src/app/practice/actions.ts", "utf8"); const mutations = readFileSync("src/lib/practice/mutations.ts", "utf8");
describe("local practice security", () => {
  it("enforces ownership and one answer per session question", () => { expect(actions).toContain("ownedSessionCondition(sessionId, owner)"); expect(migration).toContain("attempt_answers_session_question_unique"); expect(migration).toContain("attempt_answers_session_question_fk"); });
  it("grades from server-only solutions", () => { expect(mutations).toContain("questionSolutions"); expect(mutations).toContain("isCorrect"); });
  it("locks and handles submitted sessions idempotently", () => { expect(mutations).toContain('.for("update")'); expect(mutations).toContain('session.status === "submitted"'); expect(actions).toContain("submitPracticeSession"); });
});
