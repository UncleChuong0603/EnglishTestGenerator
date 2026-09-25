import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import { EdgeContentTtsProvider } from "../src/lib/content/tts.ts";
import { getTalkParagraphs, listeningTalks } from "../src/lib/listening-lessons/talks.ts";

if (!ffmpegPath) throw new Error("FFMPEG_UNAVAILABLE");
const run = promisify(execFile);
const outputDirectory = resolve("public/listening-talks");
const provider = new EdgeContentTtsProvider();
const temp = await mkdtemp(join(tmpdir(), "toeicgym-talks-"));
const paragraphFiles = new Map<string, string>();
const manifest: Record<string, { transcriptSha256: string; durationSeconds: number; byteSize: number }> = {};

await mkdir(outputDirectory, { recursive: true });
const previousManifest = JSON.parse(await readFile(join(outputDirectory, "manifest.json"), "utf8").catch(() => "{}")) as typeof manifest;
try {
  for (const talk of listeningTalks) {
    const sourceHash = createHash("sha256").update(talk.transcript).digest("hex");
    const output = join(outputDirectory, `${talk.slug}.mp3`);
    if (!process.argv.includes("--force") && previousManifest[talk.slug]?.transcriptSha256 === sourceHash) {
      const existing = await readFile(output).catch(() => null);
      if (existing?.byteLength === previousManifest[talk.slug].byteSize) {
        manifest[talk.slug] = previousManifest[talk.slug];
        process.stdout.write(`${talk.slug}: current (${manifest[talk.slug].durationSeconds}s)\n`);
        continue;
      }
    }
    const paths: string[] = [];
    for (const paragraph of getTalkParagraphs(talk)) {
      const hash = createHash("sha256").update(paragraph).digest("hex");
      let path = paragraphFiles.get(hash);
      if (!path) {
        path = join(temp, `${hash}.mp3`);
        const bytes = await provider.synthesize({ text: paragraph, voice: "en-US-AriaNeural", locale: "en-US", outputFormat: "mp3" });
        await writeFile(path, bytes);
        paragraphFiles.set(hash, path);
        process.stdout.write(`Synthesized paragraph ${paragraphFiles.size}\n`);
      }
      paths.push(path);
    }

    const concatFile = join(temp, `${talk.slug}.txt`);
    await writeFile(concatFile, paths.map(path => `file '${path.replaceAll("'", "'\\''")}'`).join("\n"));
    const rawOutput = join(temp, `${talk.slug}-raw.mp3`);
    await run(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", concatFile, "-codec:a", "libmp3lame", "-b:a", "96k", rawOutput]);
    async function duration(path: string) {
      const probe = await run(ffmpegPath!, ["-hide_banner", "-i", path, "-f", "null", "-"], { maxBuffer: 1024 * 1024 });
      const match = probe.stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
      if (!match) throw new Error(`AUDIO_DURATION_UNAVAILABLE:${talk.slug}`);
      return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
    }
    const rawDuration = await duration(rawOutput);
    const maxDuration = talk.minutes * 60 - 0.5;
    if (rawDuration > maxDuration) {
      const tempo = rawDuration / (maxDuration - 1);
      await run(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", "-i", rawOutput, "-filter:a", `atempo=${tempo.toFixed(5)}`, "-codec:a", "libmp3lame", "-b:a", "96k", output]);
    } else {
      await writeFile(output, await readFile(rawOutput));
    }
    const durationSeconds = await duration(output);
    if (durationSeconds > talk.minutes * 60) throw new Error(`AUDIO_TOO_LONG:${talk.slug}:${durationSeconds}`);
    const bytes = await readFile(output);
    manifest[talk.slug] = {
      transcriptSha256: sourceHash,
      durationSeconds,
      byteSize: bytes.byteLength,
    };
    process.stdout.write(`${talk.slug}: ${durationSeconds}s, ${bytes.byteLength} bytes\n`);
  }
  await writeFile(join(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
