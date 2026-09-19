import { describe, expect, it } from "vitest";
import { matchesLearnerRoute } from "./learner-nav-routes";

describe("Mock Tests navigation", () => {
  it("stays active across the hub, active attempts, and Reading routes", () => {
    for (const path of ["/full-mock", "/full-mock/run-1", "/full-mock/run-1/results", "/demo-test", "/demo-test/session-1", "/demo-test/session-1/results"]) {
      expect(matchesLearnerRoute(path, "/full-mock")).toBe(true);
    }
  });
  it("does not mark unrelated routes active", () => {
    expect(matchesLearnerRoute("/practice", "/full-mock")).toBe(false);
    expect(matchesLearnerRoute("/demo-testing", "/full-mock")).toBe(false);
  });
});
