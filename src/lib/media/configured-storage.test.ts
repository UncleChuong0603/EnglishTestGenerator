import { describe, expect, it, vi } from "vitest";
import { createConfiguredMediaStorage, mediaPublishingConfigFromEnv } from "./configured-storage";
import { FakeMediaStorage } from "./fake-storage";

describe("explicit publishing storage selection", () => {
  it("selects LOCAL without constructing R2", () => {
    const local = new FakeMediaStorage(), localFactory = vi.fn(() => local), r2Factory = vi.fn(() => new FakeMediaStorage());
    expect(createConfiguredMediaStorage({ provider:"LOCAL", localRoot:"/media", appUrl:"https://example.test", signingSecret:"x" }, { local:localFactory, r2:r2Factory })).toBe(local);
    expect(localFactory).toHaveBeenCalledWith("/media", "https://example.test", "x");
    expect(r2Factory).not.toHaveBeenCalled();
  });
  it("selects R2 only when explicit and keeps rollback support", () => {
    const r2 = new FakeMediaStorage(), r2Factory = vi.fn(() => r2);
    expect(createConfiguredMediaStorage({ provider:"R2", r2:{endpoint:"https://r2.invalid",accessKeyId:"id",secretAccessKey:"secret",bucketName:"bucket"} }, { local:vi.fn(), r2:r2Factory })).toBe(r2);
    expect(r2Factory).toHaveBeenCalledOnce();
  });
  it("fails closed for absent, invalid, or incomplete provider configuration", () => {
    expect(() => mediaPublishingConfigFromEnv({})).toThrow("MEDIA_STORAGE_PROVIDER_MUST_BE_EXPLICIT");
    expect(() => createConfiguredMediaStorage({provider:"LOCAL"})).toThrow("LOCAL_MEDIA_CONFIGURATION_REQUIRED");
    expect(() => createConfiguredMediaStorage({provider:"R2"})).toThrow("R2_MEDIA_CONFIGURATION_REQUIRED");
  });
});
