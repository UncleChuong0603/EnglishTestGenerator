import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/20260912220000_add_language_preferences.sql", "utf8");

describe("language preference migration", () => {
  it("keeps interface and explanation languages independent and constrained", () => {
    expect(migration).toContain("interface_language in ('en', 'vi')");
    expect(migration).toContain("explanation_language in ('en', 'vi', 'both')");
    expect(migration).toContain("interface_language text not null default 'vi'");
    expect(migration).toContain("explanation_language text not null default 'both'");
  });
});
