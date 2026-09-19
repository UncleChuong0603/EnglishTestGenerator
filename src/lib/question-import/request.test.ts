import { describe, expect, it } from "vitest";
import { IMPORT_MAX_BYTES } from "./schema";
import { ImportSizeError, readBoundedImport } from "./request";
describe("bounded import request", () => {
  it("reads a small upload", async () => expect(await readBoundedImport(new Request("https://example.test",{method:"POST",body:"{}"}))).toBe("{}"));
  it("rejects a chunked oversized upload", async () => {
    const request=new Request("https://example.test",{method:"POST",body:new ReadableStream({start(controller){controller.enqueue(new Uint8Array(IMPORT_MAX_BYTES+1));controller.close()}}),duplex:"half"} as RequestInit);
    await expect(readBoundedImport(request)).rejects.toBeInstanceOf(ImportSizeError);
  });
});
