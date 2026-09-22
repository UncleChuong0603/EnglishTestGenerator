import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PricingSection } from "./pricing-section";

describe("PricingSection", () => {
  it("shows the complete plan truth in mobile cards and the desktop table", () => {
    const html = renderToStaticMarkup(
      <PricingSection locale="en" startHref="/try" />,
    );

    expect(html).toContain("Custom practice: 3 sessions/day");
    expect(html).toContain("Baseline + reassessment every 30 days");
    expect(html).toContain("share the new-mock allowance");
    expect(html).toContain("sm:hidden");
    expect(html).toContain("sm:block");
    expect(html).not.toContain("overflow-x-auto");
    expect(html).toContain('href="/try"');
    expect(html).toContain("Take free diagnostic");
  });

  it("uses a truthful continuation action for a signed-in Free learner", () => {
    const html = renderToStaticMarkup(
      <PricingSection
        currentPlan="FREE"
        locale="vi"
        startHref="/dashboard"
      />,
    );

    expect(html).toContain("Gói hiện tại");
    expect(html).toContain('href="/dashboard"');
    expect(html).toContain("Tiếp tục học");
  });
});
