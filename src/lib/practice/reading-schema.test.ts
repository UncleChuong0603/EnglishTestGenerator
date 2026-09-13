import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260912210000_generalize_reading_practice.sql",
  "utf8",
);

describe("generalized Reading practice database security", () => {
  it("supports all Reading modes and records requested versus actual count", () => {
    expect(migration).toContain("'part_5', 'part_6', 'part_7', 'mixed_reading'");
    expect(migration).toContain("requested_question_count");
    expect(migration).toContain("requested_skill");
    expect(migration).toContain("requested_sub_skill");
  });

  it("captures and validates passage-set membership", () => {
    expect(migration).toContain("add column passage_set_id uuid");
    expect(migration).toContain("psq.passage_set_id is distinct from q.passage_set_id");
  });

  it("keeps generic grading server-only and ownership scoped", () => {
    expect(migration).toContain("where id = p_session_id and user_id = p_user_id for update");
    expect(migration).toContain("join public.question_solutions");
    expect(migration).toContain("revoke all on function public.submit_reading_practice_session");
    expect(migration).toContain("to service_role");
  });
});
