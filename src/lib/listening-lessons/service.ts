import "server-only";
import { randomUUID } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { adminAuditLogs, listeningLessons } from "@/db/schema";
import { createMediaStorage } from "@/lib/media/storage";
import { validateMediaUpload } from "@/lib/media/validation";
import { normalizeTranscript, transcriptFingerprint, validateLesson } from "./core";

type Upload = { mimeType: string; body: Uint8Array };
type LessonInput = { title: string; description: string; toeicPart: number; transcript: string; imageAlt: string; audio?: Upload; image?: Upload; removeImage?: boolean };
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class ListeningLessonError extends Error {
  constructor(readonly code: string) { super(code); }
}

// The bank and the study library must never share the same spoken content.
async function assertOutsideQuestionBank(tx: Tx, transcript: string, audioChecksum: string) {
  const collision = await tx.execute(sql`
    select 1 from listening_transcripts t
    where lower(btrim(regexp_replace(regexp_replace(t.content, '[^[:alnum:][:space:]]', '', 'g'), '[[:space:]]+', ' ', 'g'))) = ${normalizeTranscript(transcript)}
    union all
    select 1 from question_group_media gm join media_assets m on m.id = gm.media_asset_id
    where gm.role = 'AUDIO' and m.checksum = ${audioChecksum}
    union all
    select 1 from stimulus_media sm join media_assets m on m.id = sm.media_asset_id
    where sm.role = 'AUDIO' and m.checksum = ${audioChecksum}
    limit 1`);
  if (collision.rows.length) throw new ListeningLessonError("QUESTION_BANK_DUPLICATE");
}

async function uploadLessonMedia(kind: "AUDIO" | "IMAGE", file: Upload) {
  const metadata = await validateMediaUpload({ kind, accessScope: "CONTENT", mimeType: file.mimeType, body: file.body });
  const extension = kind === "AUDIO" ? "mp3" : file.mimeType === "image/png" ? "png" : file.mimeType === "image/webp" ? "webp" : "jpg";
  const key = `study/listening/${kind.toLowerCase()}/${randomUUID()}.${extension}`;
  const storage = createMediaStorage();
  await storage.upload({ key, body: file.body, contentType: file.mimeType });
  if (!await storage.exists(key)) { await storage.delete(key).catch(() => undefined); throw new ListeningLessonError("MEDIA_UPLOAD_FAILED"); }
  return { key, metadata };
}

export async function saveListeningLesson(actorId: string, input: LessonInput, id?: string) {
  const current = id ? await getAdminListeningLesson(id) : null;
  if (id && (!current || current.status !== "DRAFT")) throw new ListeningLessonError("DRAFT_REQUIRED");
  const hasImage = Boolean(input.image || (!input.removeImage && current?.imageStorageKey));
  const problem = validateLesson({ ...input, hasImage });
  if (problem) throw new ListeningLessonError(problem);
  if (!input.audio && !current) throw new ListeningLessonError("AUDIO_REQUIRED");
  const uploaded: string[] = [];
  try {
    if (input.audio) {
      const duration = (await validateMediaUpload({ kind: "AUDIO", accessScope: "CONTENT", mimeType: input.audio.mimeType, body: input.audio.body })).audioDurationMs;
      if (!duration || duration > 600_000) throw new ListeningLessonError("AUDIO_DURATION_INVALID");
    }
    const audio = input.audio ? await uploadLessonMedia("AUDIO", input.audio) : null;
    if (audio) uploaded.push(audio.key);
    const image = input.image ? await uploadLessonMedia("IMAGE", input.image) : null;
    if (image) uploaded.push(image.key);
    const values = {
      title: input.title.trim(), description: input.description.trim(), toeicPart: input.toeicPart,
      transcript: input.transcript.trim(), transcriptFingerprint: transcriptFingerprint(input.transcript),
      audioStorageKey: audio?.key ?? current!.audioStorageKey,
      audioChecksum: audio?.metadata.checksum ?? current!.audioChecksum,
      audioDurationMs: audio?.metadata.audioDurationMs ?? current?.audioDurationMs ?? null,
      imageStorageKey: image?.key ?? (input.removeImage ? null : current?.imageStorageKey ?? null),
      imageChecksum: image?.metadata.checksum ?? (input.removeImage ? null : current?.imageChecksum ?? null),
      imageAlt: hasImage ? input.imageAlt.trim() : null,
      updatedAt: new Date(),
    };
    const saved = await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(72831501)`);
      await assertOutsideQuestionBank(tx, values.transcript, values.audioChecksum);
      if (id) {
        const [locked] = await tx.select({ status: listeningLessons.status, updatedAt: listeningLessons.updatedAt }).from(listeningLessons).where(eq(listeningLessons.id, id)).for("update").limit(1);
        if (locked?.status !== "DRAFT") throw new ListeningLessonError("DRAFT_REQUIRED");
        if (locked.updatedAt.getTime() !== current!.updatedAt.getTime()) throw new ListeningLessonError("STALE_DRAFT");
        await tx.update(listeningLessons).set(values).where(eq(listeningLessons.id, id));
      } else {
        id = (await tx.insert(listeningLessons).values(values).returning({ id: listeningLessons.id }))[0].id;
      }
      await tx.insert(adminAuditLogs).values({ actorUserId: actorId, action: current ? "LISTENING_LESSON_UPDATED" : "LISTENING_LESSON_CREATED", metadata: { lessonId: id } });
      return id!;
    });
    if (current) {
      const storage = createMediaStorage();
      if (audio) await storage.delete(current.audioStorageKey).catch(() => undefined);
      if ((image || input.removeImage) && current.imageStorageKey) await storage.delete(current.imageStorageKey).catch(() => undefined);
    }
    return saved;
  } catch (error) {
    const storage = createMediaStorage();
    await Promise.all(uploaded.map((key) => storage.delete(key).catch(() => undefined)));
    const dbCode = (error as { code?: string; cause?: { code?: string } })?.code ?? (error as { cause?: { code?: string } })?.cause?.code;
    if (dbCode === "23505") throw new ListeningLessonError("LESSON_DUPLICATE");
    throw error;
  }
}

export async function publishListeningLesson(actorId: string, id: string) {
  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(72831501)`);
    const [lesson] = await tx.select().from(listeningLessons).where(eq(listeningLessons.id, id)).for("update").limit(1);
    if (!lesson || lesson.status !== "DRAFT") throw new ListeningLessonError("DRAFT_REQUIRED");
    const storage = createMediaStorage();
    if (!await storage.exists(lesson.audioStorageKey) || (lesson.imageStorageKey && !await storage.exists(lesson.imageStorageKey))) throw new ListeningLessonError("MEDIA_MISSING");
    await assertOutsideQuestionBank(tx, lesson.transcript, lesson.audioChecksum);
    await tx.update(listeningLessons).set({ status: "PUBLISHED", publishedAt: new Date(), updatedAt: new Date() }).where(eq(listeningLessons.id, id));
    await tx.insert(adminAuditLogs).values({ actorUserId: actorId, action: "LISTENING_LESSON_PUBLISHED", metadata: { lessonId: id } });
  });
}

export async function archiveListeningLesson(actorId: string, id: string) {
  await db.transaction(async (tx) => {
    const [lesson] = await tx.select({ status: listeningLessons.status }).from(listeningLessons).where(eq(listeningLessons.id, id)).for("update").limit(1);
    if (!lesson || lesson.status === "ARCHIVED") throw new ListeningLessonError("INVALID_LIFECYCLE");
    await tx.update(listeningLessons).set({ status: "ARCHIVED", updatedAt: new Date() }).where(eq(listeningLessons.id, id));
    await tx.insert(adminAuditLogs).values({ actorUserId: actorId, action: "LISTENING_LESSON_ARCHIVED", metadata: { lessonId: id } });
  });
}

export async function listAdminListeningLessons() {
  return db.select().from(listeningLessons).orderBy(desc(listeningLessons.updatedAt)).limit(200);
}

export async function getAdminListeningLesson(id: string) {
  return (await db.select().from(listeningLessons).where(eq(listeningLessons.id, id)).limit(1))[0] ?? null;
}

export async function listPublishedListeningLessons(part?: number) {
  return db.select({ id: listeningLessons.id, title: listeningLessons.title, description: listeningLessons.description, toeicPart: listeningLessons.toeicPart, audioDurationMs: listeningLessons.audioDurationMs, hasImage: listeningLessons.imageStorageKey })
    .from(listeningLessons).where(and(eq(listeningLessons.status, "PUBLISHED"), part ? eq(listeningLessons.toeicPart, part) : undefined))
    .orderBy(desc(listeningLessons.publishedAt)).limit(100);
}

export async function getPublishedListeningLesson(id: string) {
  const [lesson] = await db.select().from(listeningLessons).where(and(eq(listeningLessons.id, id), eq(listeningLessons.status, "PUBLISHED"))).limit(1);
  if (!lesson) return null;
  const storage = createMediaStorage();
  return { ...lesson, audioUrl: await storage.createReadUrl(lesson.audioStorageKey, 3600), imageUrl: lesson.imageStorageKey ? await storage.createReadUrl(lesson.imageStorageKey, 3600) : null };
}
