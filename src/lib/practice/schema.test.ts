import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260912150000_create_part5_practice.sql",
  "utf8",
);

describe("Part 5 practice database security", () => {
  it("keeps learner writes behind service-role RPCs", () => {
    expect(migration).toContain("revoke all on public.practice_sessions");
    expect(migration).toContain("grant select on public.practice_sessions");
    expect(migration).not.toMatch(/grant\s+(insert|update|delete|all).*authenticated/i);
    expect(migration).toContain("grant execute on function public.submit_part5_practice_session");
  });

  it("enforces ownership and one answer per session question", () => {
    expect(migration).toContain("where id = p_session_id and user_id = p_user_id for update");
    expect(migration).toContain("unique (session_id, question_id)");
    expect(migration).toContain("references public.practice_session_questions(session_id, question_id)");
  });

  it("selects only published Part 5 questions and grades from server-only solutions", () => {
    expect(migration).toContain("q.toeic_part = 5 and q.status = 'published'");
    expect(migration).toContain("join public.question_solutions s on s.question_id = psq.question_id");
    expect(migration).toContain("selected_id = question_record.correct_option_id");
  });

  it("locks submission and returns an existing submitted result idempotently", () => {
    expect(migration).toContain("for update;");
    expect(migration).toContain("if current_session.status = 'submitted' then");
    expect(migration).toContain("practice_sessions_one_open_part5_idx");
  });
});
