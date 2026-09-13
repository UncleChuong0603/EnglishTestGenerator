import { describe, expect, it } from "vitest";
import { getMarketingTranslations } from "./marketing";

describe("marketing translations", () => {
  it("keeps English and Vietnamese public content structurally aligned", () => {
    const en = getMarketingTranslations("en");
    const vi = getMarketingTranslations("vi");
    expect(vi.benefits.items).toHaveLength(en.benefits.items.length);
    expect(vi.how.items).toHaveLength(en.how.items.length);
    expect(vi.faq.items).toHaveLength(en.faq.items.length);
    expect(vi.pricing.freeFeatures).toHaveLength(en.pricing.freeFeatures.length);
    expect(vi.pricing.rows).toHaveLength(en.pricing.rows.length);
  });

  it("clearly separates available and unavailable pricing", () => {
    const en = getMarketingTranslations("en");
    expect(en.pricing.price).toBe("0₫");
    expect(en.pricing.soon).toBe("Coming soon");
    expect(en.pricing.notice).toContain("no checkout");
  });
});
