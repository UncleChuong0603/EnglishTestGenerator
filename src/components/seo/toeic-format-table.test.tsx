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

  it("supports the homepage dark surface without changing the default variant", () => {
    const dark = renderToStaticMarkup(<ToeicFormatTable id="toeic-format" tone="dark" />);
    const light = renderToStaticMarkup(<ToeicFormatTable />);

    expect(dark).toContain('id="toeic-format"');
    expect(dark).toContain("bg-[#0b211b]");
    expect(dark).toContain("text-[#7be5bd]");
    expect(light).toContain("bg-white");
    expect(light).not.toContain("bg-[#0b211b]");
  });
});
