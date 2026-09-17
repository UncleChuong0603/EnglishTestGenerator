import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EdgeTTS } from "node-edge-tts";

export type ContentTtsRequest = { text: string; voice: string; locale: "en-US"; outputFormat: "mp3" };
export type ContentTtsProviderName = "openai" | "edge" | "fake";

export interface ContentTtsProvider {
  synthesize(request: ContentTtsRequest): Promise<Uint8Array>;
}

export class OpenAiContentTtsProvider implements ContentTtsProvider {
  constructor(private readonly apiKey: string, private readonly model = "gpt-4o-mini-tts") {}
  async synthesize(request: ContentTtsRequest) {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, voice: request.voice, input: request.text, response_format: request.outputFormat }),
    });
    if (!response.ok) throw new Error(`CONTENT_TTS_FAILED:${response.status}`);
    return new Uint8Array(await response.arrayBuffer());
  }
}

type EdgeTtsClient = { ttsPromise(text: string, outputPath: string): Promise<unknown> };
type EdgeTtsFactory = (config: { voice: string; lang: string; outputFormat: string; saveSubtitles: boolean; timeout: number }) => EdgeTtsClient;

/** Content-authoring adapter for the Node-native Edge online TTS package. Never used by learner requests. */
export class EdgeContentTtsProvider implements ContentTtsProvider {
  constructor(private readonly factory: EdgeTtsFactory = config => new EdgeTTS(config)) {}
  async synthesize(request: ContentTtsRequest) {
    if (request.outputFormat !== "mp3") throw new Error("EDGE_TTS_FORMAT_UNSUPPORTED");
    const directory = await mkdtemp(join(tmpdir(), "toeicgym-edge-tts-"));
    const output = join(directory, "speech.mp3");
    try {
      const client = this.factory({ voice: request.voice, lang: request.locale, outputFormat: "audio-24khz-96kbitrate-mono-mp3", saveSubtitles: false, timeout: 120_000 });
      await client.ttsPromise(request.text, output);
      const bytes = new Uint8Array(await readFile(output));
      if (!bytes.byteLength) throw new Error("EDGE_TTS_EMPTY_OUTPUT");
      return bytes;
    } catch (error) {
      if (error instanceof Error && error.message === "EDGE_TTS_EMPTY_OUTPUT") throw error;
      throw new Error("EDGE_TTS_SYNTHESIS_FAILED", { cause: error });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
}

/** Deterministic provider for pipeline tests; bytes are supplied by the test itself. */
export class FakeContentTtsProvider implements ContentTtsProvider {
  readonly requests: ContentTtsRequest[] = [];
  constructor(private readonly output: Uint8Array) {}
  async synthesize(request: ContentTtsRequest) { this.requests.push(request); return this.output; }
}

export function createContentTtsProvider(input: { provider?: string; openAiApiKey?: string; openAiModel?: string; edgeFactory?: EdgeTtsFactory; fakeOutput?: Uint8Array } = {}): ContentTtsProvider {
  const provider = (input.provider || "edge").toLowerCase() as ContentTtsProviderName;
  if (provider === "edge") return new EdgeContentTtsProvider(input.edgeFactory);
  if (provider === "openai") {
    if (!input.openAiApiKey) throw new Error("OPENAI_API_KEY_REQUIRED");
    return new OpenAiContentTtsProvider(input.openAiApiKey, input.openAiModel);
  }
  if (provider === "fake") return new FakeContentTtsProvider(input.fakeOutput ?? new Uint8Array([0x49, 0x44, 0x33]));
  throw new Error(`CONTENT_TTS_PROVIDER_UNSUPPORTED:${provider}`);
}

export function selectContentVoice(provider: ContentTtsProviderName, externalId: string) {
  if (provider === "edge") {
    if (externalId.includes("P1") || externalId.includes("P3")) return "en-US-GuyNeural";
    return "en-US-AriaNeural";
  }
  return externalId.includes("P1") || externalId.includes("P3") ? "alloy" : "nova";
}
