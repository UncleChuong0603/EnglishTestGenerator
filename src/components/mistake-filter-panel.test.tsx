import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MistakeFilterPanel } from "./mistake-filter-panel";

describe("MistakeFilterPanel", () => {
  it("starts collapsed and keeps active filters discoverable", () => {
    const html = renderToStaticMarkup(
      <MistakeFilterPanel
        activeCount={2}
        clearHref="/mistakes?tab=review"
        clearLabel="Xóa bộ lọc"
        label="Bộ lọc"
      >
        <a href="/mistakes?part=5">Part 5</a>
      </MistakeFilterPanel>,
    );

    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("hidden");
    expect(html).toContain(">2<");
    expect(html).toContain('href="/mistakes?tab=review"');
    expect(html).toContain("Part 5");
  });

  it("does not show a clear action when no filter is active", () => {
    const html = renderToStaticMarkup(
      <MistakeFilterPanel
        activeCount={0}
        clearHref="/mistakes?tab=review"
        clearLabel="Clear filters"
        label="Filters"
      >
        <span>All</span>
      </MistakeFilterPanel>,
    );

    expect(html).not.toContain("Clear filters");
  });
});
