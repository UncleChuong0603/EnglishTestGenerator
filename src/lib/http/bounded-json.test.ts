import { describe, expect, it } from "vitest";
import { readBoundedJson, RequestBodyError } from "./bounded-json";

describe("readBoundedJson", () => {
  it("parses JSON within the limit", async () => {
    const request = new Request("https://example.test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ok: true }) });
    await expect(readBoundedJson(request, 64)).resolves.toEqual({ ok: true });
  });

  it("rejects oversized streamed bodies even without content-length", async () => {
    const request = new Request("https://example.test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: "x".repeat(100) }) });
    await expect(readBoundedJson(request, 32)).rejects.toMatchObject({ code: "BODY_TOO_LARGE" } satisfies Partial<RequestBodyError>);
  });

  it("rejects non-JSON content types", async () => {
    const request = new Request("https://example.test", { method: "POST", headers: { "content-type": "text/plain" }, body: "{}" });
    await expect(readBoundedJson(request, 32)).rejects.toMatchObject({ code: "INVALID_CONTENT_TYPE" } satisfies Partial<RequestBodyError>);
  });
});
