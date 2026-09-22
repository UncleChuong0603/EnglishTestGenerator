import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SimilarityFilters } from "./similarity-filters";

describe("similarity filters", () => {
  it("renders the active part consistently in the selector and scan button", () => {
    const html = renderToStaticMarkup(<SimilarityFilters part={1} lifecycle="published" threshold={0.58} />);

    expect(html).toContain("Part 1");
    expect(html).toContain("Quét Part 1");
    expect(html).toContain('value="published" selected=""');
  });

  it("keeps a custom configured threshold visible and selected", () => {
    const html = renderToStaticMarkup(<SimilarityFilters part={5} threshold={0.63} />);

    expect(html).toContain("Đang dùng · 63%");
    expect(html).toContain('value="0.63" selected=""');
  });
});
