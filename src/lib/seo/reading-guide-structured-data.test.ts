import { describe, expect, it } from "vitest";
import { readingLongTailGuides } from "./reading-long-tail";
import { readingGuideStructuredData } from "./reading-guide-structured-data";

describe("Reading guide structured data", () => {
  it("matches each visible guide and identifies the editorial team", () => {
    for (const guide of Object.values(readingLongTailGuides)) {
      const data = readingGuideStructuredData(guide);
      expect(data["@type"]).toBe("Article");
      expect(data.mainEntityOfPage).toBe(`http://localhost:3000${guide.path}`);
      expect(data.headline).toBe(guide.title);
      expect(data.datePublished).toBe(guide.publishedAt);
      expect(data.dateModified).toBe(guide.updatedAt);
      expect(data.author).toMatchObject({
        "@type": "Organization",
        name: "TOEIC GYM Editorial",
        url: "http://localhost:3000/ve-toeic-gym",
      });
    }
  });
});
