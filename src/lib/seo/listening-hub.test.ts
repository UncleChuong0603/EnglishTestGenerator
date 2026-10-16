import { describe, expect, it } from "vitest";
import { LISTENING_ERROR_ROUTES, LISTENING_HUB_PARTS, listeningHubStructuredData } from "./listening-hub";

describe("TOEIC Listening hub", () => {
  it("maps the official 100-question Listening structure to four distinct practice pages", () => {
    expect(LISTENING_HUB_PARTS.map(part => part.questions)).toEqual([6, 25, 39, 30]);
    expect(LISTENING_HUB_PARTS.reduce((sum, part) => sum + part.questions, 0)).toBe(100);
    expect(new Set(LISTENING_HUB_PARTS.map(part => part.href)).size).toBe(4);
    expect(LISTENING_ERROR_ROUTES.map(route => route.href)).toEqual(LISTENING_HUB_PARTS.map(part => part.href));
  });

  it("emits a canonical CollectionPage with an ordered ItemList", () => {
    const data = listeningHubStructuredData("https://example.com");
    expect(data).toMatchObject({
      "@type": "CollectionPage",
      "@id": "https://example.com/toeic/listening#collection",
      url: "https://example.com/toeic/listening",
      inLanguage: "vi",
      mainEntity: { "@type": "ItemList", numberOfItems: 4 },
    });
    expect(data.mainEntity.itemListElement.map(item => item.position)).toEqual([1, 2, 3, 4]);
    expect(data.mainEntity.itemListElement.map(item => item.url)).toEqual([
      "https://example.com/toeic/part-1",
      "https://example.com/toeic/part-2",
      "https://example.com/toeic/part-3",
      "https://example.com/toeic/part-4",
    ]);
  });
});
