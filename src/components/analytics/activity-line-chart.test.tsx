import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ActivityLineChart } from "./activity-line-chart";

describe("ActivityLineChart", () => {
  it("renders real series with an accessible text equivalent", () => {
    const html = renderToStaticMarkup(<ActivityLineChart
      locale="vi"
      title="Xu hướng hoạt động"
      points={[
        { label: "01/10", sessions: 2, activeLearners: 2, signups: 1 },
        { label: "02/10", sessions: 5, activeLearners: 3, signups: 2 },
      ]}
    />);
    expect(html).toContain("<polyline");
    expect(html).toContain("Xu hướng hoạt động");
    expect(html).toContain("01/10: Buổi học 2, Người học 2, Đăng ký 1");
  });

  it("shows an honest empty state", () => {
    const html = renderToStaticMarkup(<ActivityLineChart
      locale="en"
      title="Activity"
      points={[
        { label: "08:00", sessions: 0, activeLearners: 0, signups: 0 },
        { label: "09:00", sessions: 0, activeLearners: 0, signups: 0 },
      ]}
    />);
    expect(html).toContain("No activity in this period");
    expect(html).not.toContain("<polyline");
  });
});
