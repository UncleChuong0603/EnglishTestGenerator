import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260912120000_create_toeic_question_bank.sql",
  ),
  "utf8",
);

describe("TOEIC question-bank migration", () => {
  it.each([
    "passages",
    "questions",
    "question_options",
    "question_solutions",
  ])("creates and protects the %s table with RLS", (table) => {
    expect(migration).toContain(`create table public.${table}`);
    expect(migration).toContain(
      `alter table public.${table} enable row level security`,
    );
  });

  it("keeps solutions outside authenticated learner grants", () => {
    expect(migration).toContain(
      "grant select on public.passages, public.questions, public.question_options to authenticated",
    );
    expect(migration).not.toMatch(
      /grant\s+select\s+on\s+public\.question_solutions\s+to\s+authenticated/i,
    );
  });

  it("prevents a question from referencing a passage in another TOEIC part", () => {
    expect(migration).toContain("foreign key (passage_id, toeic_part)");
    expect(migration).toContain(
      "references public.passages(id, toeic_part) on delete restrict",
    );
  });
});
