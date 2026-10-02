import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { EdgeContentTtsProvider } from "../src/lib/content/tts.ts";
import { listeningSamples, part2IndirectSamples } from "../src/lib/seo/listening-samples.ts";

const provider = new EdgeContentTtsProvider();
await mkdir(resolve("public/seo"), { recursive: true });
const samples = process.argv.includes("--additional-part2") ? part2IndirectSamples : [...Object.values(listeningSamples), ...part2IndirectSamples];
for (const sample of samples) {
  const bytes = await provider.synthesize({
    text: sample.audioText,
    voice: sample.part === 1 ? "en-US-GuyNeural" : "en-US-AriaNeural",
    locale: "en-US",
    outputFormat: "mp3",
  });
  await writeFile(resolve(`public${sample.audio}`), bytes);
  process.stdout.write(`${sample.audio}: ${bytes.byteLength} bytes\n`);
}
