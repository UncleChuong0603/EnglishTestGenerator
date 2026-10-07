import { describe, expect, it } from "vitest";
import {
  getLearnerPrimaryNavigation,
  getLearnerSecondaryNavigation,
  matchesLearnerRoute,
} from "./learner-nav-routes";

describe("Learner navigation information architecture", () => {
  it.each([
    ["vi", ["Tiến độ", "Luyện tập", "Bài hôm nay", "Thi thử"]],
    ["en", ["Progress", "Practice", "Today's plan", "Mock Tests"]],
  ] as const)("uses progress as the %s learner home", (locale, labels) => {
    const items = getLearnerPrimaryNavigation(true, {
      progress: labels[0],
      practice: labels[1],
      today: labels[2],
      mockTests: labels[3],
    });

    expect(items.map(({ href, label }) => ({ href, label }))).toEqual([
      { href: "/progress", label: labels[0] },
      { href: "/practice", label: labels[1] },
      { href: "/dashboard", label: labels[2] },
      { href: "/full-mock", label: labels[3] },
    ]);
    expect(getLearnerSecondaryNavigation(locale).map((item) => item.href)).not.toContain("/");
  });

  it("keeps the selected destination through sign-in for guests", () => {
    const [progress] = getLearnerPrimaryNavigation(false, {
      progress: "Progress",
      practice: "Practice",
      today: "Today's plan",
      mockTests: "Mock Tests",
    });

    expect(progress.href).toBe("/sign-in?next=%2Fprogress");
  });
});

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
