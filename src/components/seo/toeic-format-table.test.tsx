import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ToeicFormatTable } from "./toeic-format-table";

describe("TOEIC format table", () => {
  it("renders all seven parts, totals and the official source in initial HTML", () => {
    const html = renderToStaticMarkup(<ToeicFormatTable />);
    expect(html.match(/<tr/g)).toHaveLength(9);
    expect(html).toContain("7 Part, 200 câu trong 120 phút làm bài");
    expect(html).toContain("ETS TOEIC Listening &amp; Reading Score User Guide");
    expect(html).toContain('href="/toeic/thang-diem"');
    expect(html).toContain("overflow-x-auto");
  });
});
