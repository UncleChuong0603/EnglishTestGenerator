import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const entitlement = readFileSync("src/lib/entitlements/service.ts", "utf8");
const practice = readFileSync("src/lib/practice/selector.ts", "utf8");
const mock = readFileSync("src/lib/full-mock/service.ts", "utf8");
const diagnostic = readFileSync("src/lib/diagnostic/service.ts", "utf8");
const demo = readFileSync("src/lib/demo-test/queries.ts", "utf8");

describe("entitlement enforcement architecture", () => {
  it("serializes quota decisions and writes consumption in the creation transaction", () => { expect(entitlement).toContain("pg_advisory_xact_lock"); expect(practice).toContain("consumeUsage(tx"); expect(mock).toContain("consumeUsage(tx"); });
  it("uses stable resource identities and a unique idempotency constraint", () => { expect(practice).toContain("sourceId: sessionId"); expect(mock).toContain("sourceId: runId"); expect(readFileSync("drizzle/0008_entitlements_usage.sql", "utf8")).toContain('UNIQUE ("user_id", "entitlement_key", "source_type", "source_id")'); });
  it("checks resumable resources before consumption", () => { expect(practice.indexOf('eq(practiceSessions.source, "recommended")')).toBeLessThan(practice.indexOf('entitlement: "TODAYS_WORKOUT"')); expect(mock.indexOf("if (existing) return")).toBeLessThan(mock.indexOf('entitlement: "FULL_MOCK"')); });
  it("keeps diagnostic and demo unmetered", () => { expect(diagnostic).not.toContain("consumeUsage"); expect(demo).not.toContain("consumeUsage"); });
  it("does not trust a client-provided plan", () => { expect(practice).not.toMatch(/formData\.get\(["']plan/); expect(mock).not.toMatch(/plan\s*:/); });
});
