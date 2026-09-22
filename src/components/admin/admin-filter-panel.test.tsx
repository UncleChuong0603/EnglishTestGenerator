import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AdminFilterPanel } from "./admin-filter-panel";

describe("AdminFilterPanel", () => {
  it("starts collapsed and exposes active filters without rendering the full panel visibly", () => {
    const html = renderToStaticMarkup(
      <AdminFilterPanel activeCount={2} clearHref="/admin/users" label="Filters" summary="User filters">
        <form><input name="q" /></form>
      </AdminFilterPanel>,
    );

    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("hidden");
    expect(html).toContain(">2<");
    expect(html).toContain('href="/admin/users"');
  });
});
