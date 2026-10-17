import { describe, expect, it } from "vitest";
import { ONLINE_STUDY_LOOP, ONLINE_STUDY_SIGNALS, ONLINE_STUDY_STARTS, onlineStudyHubStructuredData } from "./online-study-hub";

describe("online study SEO hub", () => {
  it("routes four learner situations to distinct next actions", () => {
    expect(ONLINE_STUDY_STARTS).toHaveLength(4);
    expect(ONLINE_STUDY_STARTS.map((item) => item.id)).toEqual(["baseline", "quick", "skill", "stamina"]);
    expect(ONLINE_STUDY_STARTS.map((item) => item.href)).toEqual([
      "/diagnostic",
      "/try#quick-practice",
      "/toeic",
      "/thi-thu-toeic-online",
    ]);
    expect(ONLINE_STUDY_LOOP).toHaveLength(4);
    expect(ONLINE_STUDY_SIGNALS).toHaveLength(4);
  });

  it("publishes a four-item absolute structured-data list", () => {
    const schema = onlineStudyHubStructuredData("https://example.com");

    expect(schema["@type"]).toBe("WebPage");
    expect(schema.url).toBe("https://example.com/luyen-thi-toeic-online");
    expect(schema.mainEntity.numberOfItems).toBe(4);
    expect(schema.mainEntity.itemListElement[0]).toMatchObject({
      position: 1,
      url: "https://example.com/diagnostic",
    });
  });
});
