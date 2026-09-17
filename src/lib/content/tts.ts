export type ContentTtsRequest = { text: string; voice: string; locale: "en-US"; outputFormat: "mp3" };

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

/** Deterministic provider for pipeline tests; bytes are supplied by the test itself. */
export class FakeContentTtsProvider implements ContentTtsProvider {
  readonly requests: ContentTtsRequest[] = [];
  constructor(private readonly output: Uint8Array) {}
  async synthesize(request: ContentTtsRequest) { this.requests.push(request); return this.output; }
}
