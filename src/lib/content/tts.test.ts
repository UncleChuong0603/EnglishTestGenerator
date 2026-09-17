import { writeFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { EdgeContentTtsProvider, FakeContentTtsProvider, OpenAiContentTtsProvider, createContentTtsProvider, selectContentVoice } from "./tts";

describe("content TTS provider", () => {
  it("is testable without a paid provider", async () => {
    const provider = new FakeContentTtsProvider(new Uint8Array([0x49, 0x44, 0x33]));
    const request = { text: "The meeting begins at ten.", voice: "test", locale: "en-US", outputFormat: "mp3" } as const;
    expect(await provider.synthesize(request)).toEqual(new Uint8Array([0x49, 0x44, 0x33]));
    expect(provider.requests).toEqual([request]);
  });
  it("selects Edge by default without an API key", () => {
    expect(createContentTtsProvider()).toBeInstanceOf(EdgeContentTtsProvider);
  });
  it("keeps OpenAI available when explicitly selected", () => {
    expect(createContentTtsProvider({ provider: "openai", openAiApiKey: "test-key" })).toBeInstanceOf(OpenAiContentTtsProvider);
  });
  it("rejects an unknown provider", () => {
    expect(() => createContentTtsProvider({ provider: "unknown" })).toThrow("CONTENT_TTS_PROVIDER_UNSUPPORTED:unknown");
  });
  it("passes the requested voice to node-edge-tts and returns MP3 bytes", async () => {
    const ttsPromise = vi.fn(async (_text: string, path: string) => writeFile(path, new Uint8Array([0x49, 0x44, 0x33, 1])));
    const factory = vi.fn(() => ({ ttsPromise }));
    const provider = new EdgeContentTtsProvider(factory);
    const bytes = await provider.synthesize({ text: "Welcome.", voice: "en-US-AriaNeural", locale: "en-US", outputFormat: "mp3" });
    expect(bytes).toEqual(new Uint8Array([0x49, 0x44, 0x33, 1]));
    expect(factory).toHaveBeenCalledWith(expect.objectContaining({ voice: "en-US-AriaNeural", lang: "en-US", outputFormat: "audio-24khz-96kbitrate-mono-mp3" }));
  });
  it("rejects empty Edge output", async () => {
    const provider = new EdgeContentTtsProvider(() => ({ ttsPromise: async (_text, path) => writeFile(path, new Uint8Array()) }));
    await expect(provider.synthesize({ text: "Welcome.", voice: "en-US-AriaNeural", locale: "en-US", outputFormat: "mp3" })).rejects.toThrow("EDGE_TTS_EMPTY_OUTPUT");
  });
  it("normalizes Edge service failures", async () => {
    const provider = new EdgeContentTtsProvider(() => ({ ttsPromise: async () => { throw new Error("socket detail"); } }));
    await expect(provider.synthesize({ text: "Welcome.", voice: "en-US-AriaNeural", locale: "en-US", outputFormat: "mp3" })).rejects.toThrow("EDGE_TTS_SYNTHESIS_FAILED");
  });
  it("selects voices deterministically", () => {
    expect(selectContentVoice("edge", "L-P3-PROD-G006")).toBe("en-US-GuyNeural");
    expect(selectContentVoice("edge", "L-P4-PROD-G006")).toBe("en-US-AriaNeural");
    expect(selectContentVoice("openai", "L-P3-PROD-G006")).toBe("alloy");
  });
});
