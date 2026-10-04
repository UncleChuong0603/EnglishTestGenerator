import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const route = (name: string) => readFileSync(`src/app/api/v1/${name}/route.ts`, "utf8");

describe("Task 43 API architecture", () => {
  it("authenticates protected handlers from bearer sessions", () => {
    for (const name of ["me", "me/preferences", "dashboard", "plan", "entitlements", "progress", "mistakes", "vocabulary", "vocabulary/[id]/review", "practice"]) expect(route(name)).toContain("requireApiActor");
  });
  it("requires durable idempotency on every practice mutation", () => {
    expect(route("practice")).toContain("idempotent(");
    expect(route("practice/[id]/answer")).toContain("idempotent(");
    expect(route("practice/[id]/submit")).toContain("idempotent(");
    expect(route("practice/[id]/remediation")).toContain("idempotent(");
    expect(readFileSync("drizzle/0049_mobile_api_v1.sql", "utf8")).toContain("api_idempotency_keys_scope_unique");
  });
  it("keeps selection and scoring on shared server services", () => {
    expect(route("practice")).toContain("createPractice(actor.user.id, body, tx)");
    expect(route("practice/[id]/submit")).toContain("submitPracticeSessionWithTx");
    expect(readFileSync("src/lib/practice/mutations.ts", "utf8")).toContain("evaluateMultipleChoice");
  });
  it("commits practice creation and its idempotency ledger in one transaction", () => {
    const practiceRoute = route("practice");
    const apiPractice = readFileSync("src/lib/api-v1/practice.ts", "utf8");
    const selector = readFileSync("src/lib/practice/selector.ts", "utf8");
    expect(practiceRoute).toContain("execute: async (tx)");
    expect(practiceRoute).toContain("createPractice(actor.user.id, body, tx)");
    expect(apiPractice).toContain("startPractice(userId");
    expect(apiPractice).toContain(", transaction)");
    expect(selector).toContain("transaction ? execute(transaction) : db.transaction(execute)");
  });
  it("keeps mobile preferences and SRS review on shared services", () => {
    expect(route("me/preferences")).toContain("updateLearnerPreferences(actor.user.id, body)");
    expect(route("vocabulary/[id]/review")).toContain("reviewVocabulary(actor.user.id, id.data, body.remembered)");
  });
});
