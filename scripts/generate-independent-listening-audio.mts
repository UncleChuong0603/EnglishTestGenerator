import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { EdgeContentTtsProvider } from "../src/lib/content/tts.ts";
import { independentLessons } from "../src/lib/listening-lessons/independent.ts";

const directory = resolve("public/listening-exercises");
const provider = new EdgeContentTtsProvider();
await mkdir(directory, { recursive: true });

for (const [index, lesson] of independentLessons.entries()) {
  const bytes = await provider.synthesize({ text: lesson.transcript, voice: index % 2 === 0 ? "en-US-AriaNeural" : "en-US-GuyNeural", locale: "en-US", outputFormat: "mp3" });
  const path = resolve(directory, `${lesson.slug}.mp3`);
  await writeFile(path, bytes);
  process.stdout.write(`${lesson.slug}: ${bytes.byteLength} bytes\n`);
}
