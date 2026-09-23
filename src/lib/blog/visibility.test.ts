import { describe, expect, it } from "vitest";
import { isEditorialVisible } from "./core";

describe("bundled editorial visibility", () => {
  it("keeps the original article visible while a CMS edit is a draft", () => {
    expect(isEditorialVisible(undefined)).toBe(true);
    expect(isEditorialVisible("DRAFT")).toBe(true);
  });

  it("lets published CMS content replace it and unpublishing hide it", () => {
    expect(isEditorialVisible("PUBLISHED")).toBe(false);
    expect(isEditorialVisible("UNPUBLISHED")).toBe(false);
  });
});
