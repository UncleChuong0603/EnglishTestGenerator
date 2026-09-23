import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import type { ContentTtsProvider, ContentTtsRequest } from "./tts";

const run = promisify(execFile);
const sampleRate = 24_000;
const labelAudioCache = new WeakMap<ContentTtsProvider, Map<string, Promise<Uint8Array>>>();

function synthesizeSegment(provider: ContentTtsProvider, request: ContentTtsRequest) {
  if (!/^(?:Question|[A-D])\.$/.test(request.text)) return provider.synthesize(request);
  let cache = labelAudioCache.get(provider);
  if (!cache) { cache = new Map(); labelAudioCache.set(provider, cache); }
  const key = `${request.voice}:${request.locale}:${request.outputFormat}:${request.text}`;
  let output = cache.get(key);
  if (!output) {
    output = provider.synthesize(request).catch(error => { cache?.delete(key); throw error; });
    cache.set(key, output);
  }
  return output;
}

function trimPcmSilence(pcm: Buffer): Buffer {
  const windowSamples = 240;
  const sampleCount = pcm.byteLength / 2;
  let peak = 0;
  for (let i = 0; i < sampleCount; i++) peak = Math.max(peak, Math.abs(pcm.readInt16LE(i * 2)));
  const threshold = Math.max(100, peak * 0.015);
  let first = -1, last = -1;
  for (let start = 0, window = 0; start < sampleCount; start += windowSamples, window++) {
    let loud = false;
    for (let i = start; i < Math.min(start + windowSamples, sampleCount); i++) {
      if (Math.abs(pcm.readInt16LE(i * 2)) > threshold) { loud = true; break; }
    }
    if (loud) { if (first < 0) first = window; last = window; }
  }
  if (first < 0) throw new Error("LISTENING_AUDIO_SEGMENT_SILENT");
  const pad = Math.round(sampleRate * 0.03);
  const from = Math.max(0, first * windowSamples - pad);
  const to = Math.min(sampleCount, (last + 1) * windowSamples + pad);
  return pcm.subarray(from * 2, to * 2);
}

export type AudioSegment = { text: string; pauseAfterMs: number };
type ListeningAudioItem = {
  part: number;
  transcript: string;
  question?: { options: { key: string; text: string }[] };
};

export function planListeningAudio(item: ListeningAudioItem): AudioSegment[] {
  if (item.part !== 1 && item.part !== 2) return [{ text: item.transcript, pauseAfterMs: 0 }];
  const options = item.question?.options;
  if (!options?.length) throw new Error("LISTENING_AUDIO_OPTIONS_MISSING");
  const segments: AudioSegment[] = [];
  if (item.part === 2) {
    const prompt = item.transcript.match(/^Question:\s*(.+?)(?:\r?\n|$)/)?.[1];
    if (!prompt) throw new Error("LISTENING_AUDIO_PROMPT_MISSING");
    segments.push({ text: "Question.", pauseAfterMs: 450 });
    segments.push({ text: prompt, pauseAfterMs: 1200 });
  }
  for (const [index, option] of options.entries()) {
    segments.push({ text: `${option.key}.`, pauseAfterMs: 400 });
    segments.push({ text: option.text, pauseAfterMs: index === options.length - 1 ? 0 : 1000 });
  }
  return segments;
}

export async function synthesizeListeningAudio(
  provider: ContentTtsProvider,
  request: Omit<ContentTtsRequest, "text">,
  segments: AudioSegment[],
): Promise<Uint8Array> {
  if (segments.length === 1 && segments[0].pauseAfterMs === 0) return provider.synthesize({ ...request, text: segments[0].text });
  if (!ffmpegPath) throw new Error("FFMPEG_UNAVAILABLE");
  const directory = await mkdtemp(join(tmpdir(), "toeicgym-audio-segments-"));
  try {
    const pcmParts: Buffer[] = [];
    for (const [index, segment] of segments.entries()) {
      const mp3 = join(directory, `${index}.mp3`);
      const pcm = join(directory, `${index}.pcm`);
      await writeFile(mp3, await synthesizeSegment(provider, { ...request, text: segment.text }));
      await run(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", "-i", mp3, "-f", "s16le", "-ac", "1", "-ar", String(sampleRate), pcm]);
      pcmParts.push(trimPcmSilence(await readFile(pcm)));
      if (segment.pauseAfterMs) pcmParts.push(Buffer.alloc(Math.round(sampleRate * segment.pauseAfterMs / 1000) * 2));
    }
    const input = join(directory, "combined.pcm");
    const output = join(directory, "combined.mp3");
    await writeFile(input, Buffer.concat(pcmParts));
    await run(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", "-f", "s16le", "-ac", "1", "-ar", String(sampleRate), "-i", input, "-codec:a", "libmp3lame", "-b:a", "96k", output]);
    return new Uint8Array(await readFile(output));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
