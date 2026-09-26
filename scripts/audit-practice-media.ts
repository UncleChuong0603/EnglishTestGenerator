import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { practiceListening } from "./content-manifest.mjs";
import { validateMediaUpload } from "../src/lib/media/validation";

async function main() {
  const allowMissingImages = process.argv.includes("--allow-missing-images");
  let audio = 0;
  let images = 0;
  let missingImages = 0;
  let bytes = 0;
  let minDurationMs = Infinity;
  let maxDurationMs = 0;
  for (const item of practiceListening) {
    for (const spec of item.media) {
      const extension = spec.role === "AUDIO" ? "mp3" : "png";
      const path = resolve(".content-generated", `${item.externalId}.${extension}`);
      if (!existsSync(path)) {
        if (spec.role === "IMAGE" && allowMissingImages) { missingImages++; continue; }
        throw new Error(`Missing ${spec.role.toLowerCase()}: ${item.externalId}`);
      }
      const result = await validateMediaUpload({ kind: spec.role, accessScope: "CONTENT", mimeType: spec.role === "AUDIO" ? "audio/mpeg" : "image/png", body: new Uint8Array(await readFile(path)) });
      bytes += result.byteSize;
      if (spec.role === "AUDIO") {
        if (!result.audioDurationMs) throw new Error(`Unreadable audio duration: ${item.externalId}`);
        audio++;
        minDurationMs = Math.min(minDurationMs, result.audioDurationMs);
        maxDurationMs = Math.max(maxDurationMs, result.audioDurationMs);
      } else {
        if (!result.imageWidth || !result.imageHeight) throw new Error(`Unreadable image dimensions: ${item.externalId}`);
        images++;
      }
    }
  }
  console.log(JSON.stringify({ audio, images, missingImages, mediaMiB: Math.round(bytes / 1048576), minDurationMs, maxDurationMs }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
