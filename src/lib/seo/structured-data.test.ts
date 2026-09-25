import { describe, expect, it } from "vitest";
import { breadcrumbStructuredData, serializeStructuredData } from "./structured-data";
import { getSiteUrl } from "./site-url";

describe("SEO structured data", () => {
  it("keeps breadcrumb positions and URLs aligned with the visible trail", () => {
    const trail = breadcrumbStructuredData([
      { name: "Trang chủ", path: "/" },
      { name: "TOEIC", path: "/toeic" },
      { name: "Part 5", path: "/toeic/part-5" },
    ]);
    expect(trail.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: `${getSiteUrl()}/` },
      { "@type": "ListItem", position: 2, name: "TOEIC", item: `${getSiteUrl()}/toeic` },
      { "@type": "ListItem", position: 3, name: "Part 5", item: `${getSiteUrl()}/toeic/part-5` },
    ]);
  });

  it("escapes HTML inside JSON-LD script content", () => {
    const json = serializeStructuredData({ name: '</script><script>alert(1)</script>' });
    expect(json).not.toContain("<");
    expect(JSON.parse(json)).toEqual({ name: '</script><script>alert(1)</script>' });
  });
});
