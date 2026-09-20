import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TrendChart } from "./charts";

const point = (day: string, answeredCount: number, correctCount: number) => ({
  day,
  answeredCount,
  correctCount,
  accuracy: answeredCount ? Math.round((correctCount / answeredCount) * 100) : null,
});

describe("TrendChart", () => {
  it("does not connect learning days across an inactive gap", () => {
    const html = renderToStaticMarkup(
      <TrendChart
        emptyText="No data"
        locale="en"
        points={[
          point("2026-09-14", 5, 4),
          point("2026-09-15", 0, 0),
          point("2026-09-16", 10, 6),
        ]}
        title="Accuracy trend"
      />,
    );

    expect(html).not.toContain("<polyline");
    expect(html).toContain("inactive days remain blank");
    expect(html).toContain("Answers");
  });

  it("connects consecutive learning days", () => {
    const html = renderToStaticMarkup(
      <TrendChart
        emptyText="Không có dữ liệu"
        locale="vi"
        points={[
          point("2026-09-14", 5, 4),
          point("2026-09-15", 10, 6),
          point("2026-09-16", 0, 0),
        ]}
        title="Xu hướng độ chính xác"
      />,
    );

    expect(html).toContain("<polyline");
    expect(html).toContain("Số câu trả lời");
    expect(html).toContain("ngày không học được để trống");
  });
});
