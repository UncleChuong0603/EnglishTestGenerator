import { IMPORT_MAX_BYTES } from "./schema";

export class ImportSizeError extends Error { constructor() { super("FILE_TOO_LARGE"); } }

export async function readBoundedImport(request: Request): Promise<string> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > IMPORT_MAX_BYTES) throw new ImportSizeError();
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > IMPORT_MAX_BYTES) { await reader.cancel(); throw new ImportSizeError(); }
    chunks.push(value);
  }
  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder("utf-8", { fatal: true }).decode(output);
}
