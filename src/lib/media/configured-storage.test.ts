import { describe, expect, it, vi } from "vitest";
import { createConfiguredMediaStorage, mediaPublishingConfigFromEnv } from "./configured-storage";
import { FakeMediaStorage } from "./fake-storage";

describe("explicit publishing storage selection", () => {
  it("selects LOCAL without constructing R2", () => {
    const local = new FakeMediaStorage(), localFactory = vi.fn(() => local);
    expect(createConfiguredMediaStorage({ localRoot:"/media", appUrl:"https://example.test", signingSecret:"x" }, { local:localFactory })).toBe(local);
    expect(localFactory).toHaveBeenCalledWith("/media", "https://example.test", "x");
  });
  it("fails closed for absent, invalid, or incomplete provider configuration", () => {
    expect(() => mediaPublishingConfigFromEnv({ MEDIA_STORAGE_PROVIDER:"R2" })).toThrow("MEDIA_STORAGE_PROVIDER_MUST_BE_LOCAL");
    expect(() => createConfiguredMediaStorage({})).toThrow("LOCAL_MEDIA_CONFIGURATION_REQUIRED");
  });
});
