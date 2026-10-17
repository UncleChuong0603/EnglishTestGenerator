import { describe, expect, it } from "vitest";
import { MOCK_TEST_HUB_MODES, mockTestHubStructuredData } from "./mock-test-hub";

describe("mock test SEO hub", () => {
  it("documents every available test length without implying an official score", () => {
    expect(MOCK_TEST_HUB_MODES.map((mode) => mode.id)).toEqual(["quick", "listening", "reading", "full"]);
    expect(MOCK_TEST_HUB_MODES.map((mode) => mode.time)).toEqual([
      "Khoảng 7–10 phút",
      "45 phút",
      "75 phút",
      "120 phút làm bài",
    ]);
    expect(MOCK_TEST_HUB_MODES[0].access).toBe("Không cần tài khoản");
    expect(MOCK_TEST_HUB_MODES.slice(1).every((mode) => mode.access.includes("Cần tài khoản"))).toBe(true);
    expect(MOCK_TEST_HUB_MODES.every((mode) => !mode.result.includes("điểm TOEIC"))).toBe(true);
  });

  it("publishes an absolute ItemList for the four choices", () => {
    const schema = mockTestHubStructuredData("https://example.com");

    expect(schema["@type"]).toBe("CollectionPage");
    expect(schema.url).toBe("https://example.com/thi-thu-toeic-online");
    expect(schema.mainEntity.numberOfItems).toBe(4);
    expect(schema.mainEntity.itemListElement[0]).toMatchObject({
      position: 1,
      name: "Bài thử nhanh",
      url: "https://example.com/try#quick-practice",
    });
  });
});
