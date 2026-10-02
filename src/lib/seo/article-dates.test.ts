import { describe, expect, it } from "vitest";
import { articleDateLabels } from "./article-dates";

describe("article date labels", () => {
  it("shows a later material update in both supported interface languages", () => {
    const publishedAt = new Date("2026-09-20T00:00:00.000Z");
    const updatedAt = new Date("2026-10-02T00:00:00.000Z");
    expect(articleDateLabels(publishedAt, updatedAt, "vi")).toEqual({
      published: "Đăng 20/9/2026",
      updated: "Cập nhật 2/10/2026",
    });
    expect(articleDateLabels(publishedAt, updatedAt, "en")).toEqual({
      published: "Published 9/20/2026",
      updated: "Updated 10/2/2026",
    });
  });

  it("does not claim freshness for an edit on the publication day", () => {
    const publishedAt = new Date("2026-10-02T00:00:00.000Z");
    const updatedAt = new Date("2026-10-02T12:00:00.000Z");
    expect(articleDateLabels(publishedAt, updatedAt, "vi").updated).toBeNull();
  });
});
