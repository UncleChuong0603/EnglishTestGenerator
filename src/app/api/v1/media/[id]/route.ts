import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { mediaAssets, practiceSessionQuestions, practiceSessions, questionGroupMedia } from "@/db/schema";
import { uuidSchema } from "@/lib/api-v1/contracts";
import { ApiV1Error } from "@/lib/api-v1/errors";
import { apiHandler, requireApiActor } from "@/lib/api-v1/http";
import { getServerEnv } from "@/lib/env";
import { safeMediaPath } from "@/lib/media/local-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    const mediaId = uuidSchema.safeParse((await params).id);
    const sessionId = uuidSchema.safeParse(new URL(request.url).searchParams.get("session"));
    if (!mediaId.success || !sessionId.success) throw new ApiV1Error(404, "NOT_FOUND", "Media not found.");
    const [asset] = await db.select({ storageKey: mediaAssets.storageKey, mimeType: mediaAssets.mimeType, byteSize: mediaAssets.byteSize })
      .from(mediaAssets)
      .innerJoin(questionGroupMedia, eq(questionGroupMedia.mediaAssetId, mediaAssets.id))
      .innerJoin(practiceSessionQuestions, eq(practiceSessionQuestions.passageSetId, questionGroupMedia.questionGroupId))
      .innerJoin(practiceSessions, eq(practiceSessions.id, practiceSessionQuestions.sessionId))
      .where(and(eq(mediaAssets.id, mediaId.data), eq(mediaAssets.status, "READY"), eq(mediaAssets.accessScope, "CONTENT"), eq(practiceSessions.id, sessionId.data), eq(practiceSessions.userId, actor.user.id), eq(practiceSessions.status, "in_progress")))
      .limit(1);
    const root = getServerEnv().LOCAL_MEDIA_ROOT;
    if (!asset || !root) throw new ApiV1Error(404, "NOT_FOUND", "Media not found.");
    const path = safeMediaPath(root, asset.storageKey);
    let size: number;
    try { size = (await stat(path)).size; } catch { throw new ApiV1Error(404, "NOT_FOUND", "Media not found."); }
    const range = request.headers.get("range")?.match(/^bytes=(\d+)-(\d*)$/);
    const start = range ? Number(range[1]) : 0;
    const requestedEnd = range?.[2] ? Number(range[2]) : size - 1;
    const end = Math.min(requestedEnd, size - 1);
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    const stream = Readable.toWeb(createReadStream(path, { start, end })) as ReadableStream<Uint8Array>;
    return new Response(stream, { status: range ? 206 : 200, headers: { "Content-Type": asset.mimeType, "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes", ...(range ? { "Content-Range": `bytes ${start}-${end}/${size}` } : {}), "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff" } });
  });
}
