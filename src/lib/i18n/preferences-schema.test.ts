import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const migration = readFileSync("drizzle/0000_lively_mordo.sql", "utf8");
describe("local language preferences", () => { it("keeps both settings independent and constrained", () => { expect(migration).toContain("profiles_interface_language_check"); expect(migration).toContain("profiles_explanation_language_check"); expect(migration).toContain("'en', 'vi', 'both'"); }); });
