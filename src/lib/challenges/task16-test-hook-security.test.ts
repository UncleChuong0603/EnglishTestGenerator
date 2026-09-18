import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Task 16 test hook security", () => {
  it("has no HTTP helper and refuses production or missing explicit test mode", () => {
    const service = readFileSync("src/lib/challenges/service.ts", "utf8");
    const routes = readFileSync("src/app/ranking/challenges/actions.ts", "utf8");
    expect(service).toContain('process.env.NODE_ENV==="production"');
    expect(service).toContain('process.env.TASK16_TEST_MODE!=="true"');
    expect(routes).not.toContain("installTask16TestHooks");
  });
  it("maps archive trigger failures to bilingual Admin copy", () => {
    const actions = readFileSync("src/app/admin/content/actions.ts", "utf8");
    expect(actions).toContain("CONTENT_USED_BY_ACTIVE_CHALLENGE");
    expect(actions).toContain("sắp diễn ra hoặc đang diễn ra");
    expect(actions).toContain("upcoming or active ranked challenge");
  });
});
