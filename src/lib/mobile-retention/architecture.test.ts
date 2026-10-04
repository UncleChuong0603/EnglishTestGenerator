import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Task 48 native retention architecture", () => {
  const service = readFileSync("src/lib/mobile-retention/service.ts", "utf8");
  const migration = readFileSync("drizzle/0052_task48_native_retention.sql", "utf8");
  const reviewRoute = readFileSync("src/app/api/v1/vocabulary/[id]/review/route.ts", "utf8");

  it("defaults push to opt-out and stores granular preferences", () => {
    expect(service).toContain("enabled: false");
    for (const field of ["todays_workout", "vocabulary_due", "unresolved_review", "weekly_review", "streak"]) expect(migration).toContain(field);
  });

  it("deduplicates daily sends and removes invalid devices", () => {
    expect(migration).toContain('UNIQUE("device_id","kind","local_date")');
    expect(service).toContain("shouldRemovePushDevice(code)");
    expect(service).toContain("db.delete(mobilePushDevices)");
  });

  it("keeps offline vocabulary sync idempotent and server-authoritative", () => {
    expect(reviewRoute).toContain("requireIdempotencyKey(request)");
    expect(reviewRoute).toContain("idempotent({");
    expect(reviewRoute).toContain("reviewVocabulary(actor.user.id, id.data, body.remembered, tx)");
  });
});
