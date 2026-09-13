import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const migration = readFileSync("drizzle/0000_lively_mordo.sql", "utf8"); const querySource = readFileSync("src/lib/questions/queries.ts", "utf8");
describe("local TOEIC question bank", () => {
  it.each(["passages", "questions", "question_options", "question_solutions"])("creates %s", (table) => expect(migration).toContain(`CREATE TABLE "${table}"`));
  it("keeps solutions outside learner-safe queries", () => { expect(querySource).not.toContain("questionSolutions"); expect(querySource).not.toContain("correctOptionId"); });
  it("constrains answer keys to an option on the same question", () => expect(migration).toContain("question_solutions_option_question_fk"));
});
