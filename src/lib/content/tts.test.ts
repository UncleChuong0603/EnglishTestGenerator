import { describe, expect, it } from "vitest";
import { FakeContentTtsProvider } from "./tts";

describe("content TTS provider", () => {
  it("is testable without a paid provider", async () => {
    const provider = new FakeContentTtsProvider(new Uint8Array([0x49, 0x44, 0x33]));
    const request = { text: "The meeting begins at ten.", voice: "test", locale: "en-US", outputFormat: "mp3" } as const;
    expect(await provider.synthesize(request)).toEqual(new Uint8Array([0x49, 0x44, 0x33]));
    expect(provider.requests).toEqual([request]);
  });
});
