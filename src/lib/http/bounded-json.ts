export class RequestBodyError extends Error {
  constructor(readonly code: "INVALID_CONTENT_TYPE" | "BODY_TOO_LARGE" | "INVALID_JSON") {
    super(code);
  }
}

export async function readBoundedJson(request: Request, maxBytes: number): Promise<unknown> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") throw new RequestBodyError("INVALID_CONTENT_TYPE");

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declared) && declared > maxBytes) throw new RequestBodyError("BODY_TOO_LARGE");

  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError("INVALID_JSON");
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      throw new RequestBodyError("BODY_TOO_LARGE");
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body)); }
  catch { throw new RequestBodyError("INVALID_JSON"); }
}
