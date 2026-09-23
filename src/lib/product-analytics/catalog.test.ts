import { describe, expect, it } from "vitest";
import { browserEventSchema, safePropertiesSchema } from "./catalog";

describe("product analytics schemas", () => {
  it("accepts only allowlisted browser events and no actor identity", () => {
    expect(browserEventSchema.safeParse({ eventName: "landing_viewed", route: "/", deduplicationKey: "landing:123456" }).success).toBe(true);
    expect(browserEventSchema.safeParse({ eventName: "challenge_viewed", route: "/challenge/part-5", deduplicationKey: "challenge:123456" }).success).toBe(true);
    expect(browserEventSchema.safeParse({ eventName: "challenge_completed", route: "/challenge/part-5", deduplicationKey: "challenge:123456" }).success).toBe(false);
    expect(browserEventSchema.safeParse({ eventName: "premium_activated", route: "/", deduplicationKey: "payment:123456" }).success).toBe(false);
    expect(browserEventSchema.safeParse({ eventName: "landing_viewed", route: "/", deduplicationKey: "landing:123456", userId: "spoof" }).success).toBe(false);
  });
  it("rejects unbounded or nested properties", () => {
    expect(safePropertiesSchema.safeParse({ safe: "value" }).success).toBe(true);
    expect(safePropertiesSchema.safeParse({ nested: { secret: true } }).success).toBe(false);
    expect(safePropertiesSchema.safeParse(Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`k${i}`, i]))).success).toBe(false);
  });
});
