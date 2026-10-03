import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({ saveLearningEmailPreference: vi.fn() }));
import { LearningEmailForm } from "./learning-email-form";

describe("LearningEmailForm", () => {
  it("explains consent and renders the current Vietnamese state", () => {
    const html = renderToStaticMarkup(<LearningEmailForm enabled locale="vi" />);
    expect(html).toContain("Tổng kết: ngày học, số câu và độ chính xác");
    expect(html).toContain("tối đa một email trong 24 giờ");
    expect(html).toMatch(/checked="" value="true"/);
    expect(html).toContain("có thể đổi lựa chọn");
  });

  it("renders complete English copy", () => {
    const html = renderToStaticMarkup(<LearningEmailForm enabled={false} locale="en" />);
    expect(html).toContain("Learning reports &amp; reminders");
    expect(html).toContain("Receive a weekly report");
    expect(html).toMatch(/checked="" value="false"/);
    expect(html).not.toContain("Lưu lựa chọn");
  });
});
