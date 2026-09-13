import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const migration = readFileSync("drizzle/0000_lively_mordo.sql", "utf8");
describe("local Reading passage sets", () => {
  it("preserves explicit ordering", () => { expect(migration).toContain("passages_set_position_unique"); expect(migration).toContain("questions_set_order_unique"); });
  it("supports valid Part 6/7 shapes", () => { expect(migration).toContain("passage_sets_part_type_check"); expect(migration).toContain("questions_reading_association_check"); });
  it("uses local query indexes", () => expect(migration).toContain("questions_published_taxonomy_idx"));
});
