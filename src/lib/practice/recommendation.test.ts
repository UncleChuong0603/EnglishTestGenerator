import { describe, expect, it } from "vitest";

import { recommendationScore } from "./selection";

describe("recommendation ranking", () => {
  it("prioritizes a weak recent area with sufficient evidence", () => {
    const weak = recommendationScore({ attempted: 12, accuracy: 45, recentAccuracy: 40, trend: "Declining", availableQuestionCount: 20 });
    const strong = recommendationScore({ attempted: 20, accuracy: 85, recentAccuracy: 85, trend: "Stable", availableQuestionCount: 20 });
    expect(weak).toBeGreaterThan(strong);
  });

  it("discounts recommendations with limited content", () => {
    const fullBank = recommendationScore({ attempted: 10, accuracy: 40, recentAccuracy: 40, trend: "Stable", availableQuestionCount: 20 });
    const smallBank = recommendationScore({ attempted: 10, accuracy: 40, recentAccuracy: 40, trend: "Stable", availableQuestionCount: 5 });
    expect(fullBank).toBeGreaterThan(smallBank);
  });

  it("weights recent accuracy more than lifetime accuracy", () => {
    const stillWeak = recommendationScore({ attempted: 20, accuracy: 55, recentAccuracy: 40, trend: "Declining", availableQuestionCount: 20 });
    const recovering = recommendationScore({ attempted: 20, accuracy: 45, recentAccuracy: 75, trend: "Improving", availableQuestionCount: 20 });
    expect(stillWeak).toBeGreaterThan(recovering);
  });
});
