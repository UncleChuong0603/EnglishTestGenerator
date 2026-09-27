import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PricingSection } from "./pricing-section";

describe("PricingSection", () => {
  it("shows the complete plan truth in mobile cards and the desktop table", () => {
    const html = renderToStaticMarkup(
      <PricingSection locale="en" startHref="/try" />,
    );

    expect(html).toContain("Custom practice: 3 sessions/day");
    expect(html).toContain("Baseline + reassessment after a 30-day cooldown");
    expect(html).toContain("Smart mistake review");
    expect(html).toContain("Weekly Plan");
    expect(html).toContain("Weekly Review");
    expect(html).not.toContain("New Mock Tests");
    expect(html).toContain("share the new-mock allowance");
    expect(html).toContain("Reading demo is separate");
    expect(html).toContain("Premium upgrades");
    expect(html).toContain("Included in both plans");
    expect(html).toContain("lg:hidden");
    expect(html).toContain("lg:block");
    expect(html).not.toContain("overflow-x-auto");
    expect(html).toContain('href="/try"');
    expect(html).toContain("Take free diagnostic");
  });

  it("advertises new mocks only when a startable mode is ready", () => {
    const html = renderToStaticMarkup(<PricingSection locale="en" mockReady />);
    expect(html).toContain("New Mock Tests: 1 new mock/month");
    expect(html).toContain("New Mock Tests: Unlimited");
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

  it("keeps the pricing page introduction concise", () => {
    const html = renderToStaticMarkup(
      <PricingSection locale="en" showIntro={false} />,
    );

    expect(html).toContain("Choose your plan");
    expect(html).not.toContain("Start free. Upgrade when you need more targeted practice.");
  });
});
