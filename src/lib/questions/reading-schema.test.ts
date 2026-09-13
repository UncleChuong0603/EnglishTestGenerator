import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260912180000_expand_toeic_reading_bank.sql",
  "utf8",
);

describe("TOEIC Reading passage-set migration", () => {
  it("creates protected passage sets and preserves explicit ordering", () => {
    expect(migration).toContain("create table public.passage_sets");
    expect(migration).toContain("alter table public.passage_sets enable row level security");
    expect(migration).toContain("passages_set_position_unique unique (passage_set_id, position)");
    expect(migration).toContain("questions_set_order_unique unique (passage_set_id, question_order)");
  });

  it("supports only valid Part 6 and Part 7 set shapes", () => {
    expect(migration).toContain("toeic_part = 6 and set_type = 'part6'");
    expect(migration).toContain("toeic_part = 7 and set_type in ('single', 'double', 'triple')");
    expect(migration).toContain("toeic_part = 6 and passage_set_id is not null and passage_id is not null");
  });

  it("keeps learner access read-only and solutions server-only", () => {
    expect(migration).toContain("grant select on public.passage_sets to authenticated");
    expect(migration).not.toMatch(/grant\s+(insert|update|delete|all).*authenticated/i);
    expect(migration).not.toMatch(/question_solutions\s+to\s+authenticated/i);
  });

  it("adds the expected query indexes and canonical Reading taxonomy", () => {
    expect(migration).toContain("passage_sets_published_part_type_idx");
    expect(migration).toContain("questions_set_order_idx");
    expect(migration).toContain("'sentence_insertion'");
    expect(migration).toContain("'cross_text'");
  });
});
