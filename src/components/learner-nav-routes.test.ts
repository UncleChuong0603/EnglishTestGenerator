import { describe, expect, it } from "vitest";
import {
  getLearnerPrimaryNavigation,
  getLearnerSecondaryNavigation,
  matchesLearnerRoute,
} from "./learner-nav-routes";

describe("Learner navigation information architecture", () => {
  it.each([
    ["vi", ["Bài hôm nay", "Tiến độ", "Luyện tập", "Thi thử"]],
    ["en", ["Today's plan", "Progress", "Practice", "Mock Tests"]],
  ] as const)("puts today's plan first in the %s learner navigation", (locale, labels) => {
    const items = getLearnerPrimaryNavigation(true, {
      today: labels[0],
      progress: labels[1],
      practice: labels[2],
      mockTests: labels[3],
    });

    expect(items.map(({ href, label }) => ({ href, label }))).toEqual([
      { href: "/dashboard", label: labels[0] },
      { href: "/progress", label: labels[1] },
      { href: "/practice", label: labels[2] },
      { href: "/full-mock", label: labels[3] },
    ]);
    expect(getLearnerSecondaryNavigation(locale).map((item) => item.href)).not.toContain("/");
  });

  it("keeps the selected destination through sign-in for guests", () => {
    const [today, progress, practice, mockTests] = getLearnerPrimaryNavigation(false, {
      progress: "Progress",
      practice: "Practice",
      today: "Today's plan",
      mockTests: "Mock Tests",
    });

    expect(today.href).toBe("/sign-in?next=%2Fdashboard");
    expect(progress.href).toBe("/sign-in?next=%2Fprogress");
    expect(practice.href).toBe("/sign-in?next=%2Fpractice");
    expect(mockTests.href).toBe("/full-mock");
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
