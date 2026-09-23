"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/authorization";
import { archiveListeningLesson, ListeningLessonError, publishListeningLesson, saveListeningLesson } from "@/lib/listening-lessons/service";
import { MEDIA_LIMITS } from "@/lib/media/validation";

function value(fd: FormData, key: string) { return String(fd.get(key) ?? "").trim(); }
async function upload(fd: FormData, key: string, limit: number) {
  const file = fd.get(key);
  if (!(file instanceof File) || file.size === 0) return undefined;
  if (file.size > limit) throw new ListeningLessonError("MEDIA_TOO_LARGE");
  return { mimeType: file.type, body: new Uint8Array(await file.arrayBuffer()) };
}
function refresh(id?: string) {
  revalidatePath("/listening-lessons"); revalidatePath("/admin/listening-lessons");
  if (id) revalidatePath(`/listening-lessons/${id}`);
}

export async function saveLessonAction(fd: FormData) {
  const actor = await requireAdmin("CONTENT_MANAGE");
  const id = value(fd, "id");
  let saved: string;
  try {
    saved = await saveListeningLesson(actor.id, {
      title: value(fd, "title"), description: value(fd, "description"), toeicPart: Number(value(fd, "toeicPart")),
      transcript: value(fd, "transcript"), imageAlt: value(fd, "imageAlt"),
      audio: await upload(fd, "audio", MEDIA_LIMITS.AUDIO), image: await upload(fd, "image", MEDIA_LIMITS.IMAGE),
      removeImage: fd.get("removeImage") === "on",
    }, id || undefined);
    refresh(saved);
  } catch (error) {
    const code = error instanceof ListeningLessonError ? error.code : error instanceof Error ? error.message : "SAVE_FAILED";
    redirect(`${id ? `/admin/listening-lessons/${id}` : "/admin/listening-lessons/new"}?error=${encodeURIComponent(code)}`);
  }
  redirect(`/admin/listening-lessons/${saved}?saved=1`);
}

export async function publishLessonAction(fd: FormData) {
  const actor = await requireAdmin("CONTENT_MANAGE"); const id = value(fd, "id");
  try { await publishListeningLesson(actor.id, id); refresh(id); }
  catch (error) { redirect(`/admin/listening-lessons/${id}?error=${encodeURIComponent(error instanceof Error ? error.message : "PUBLISH_FAILED")}`); }
  redirect(`/admin/listening-lessons/${id}?published=1`);
}

export async function archiveLessonAction(fd: FormData) {
  const actor = await requireAdmin("CONTENT_MANAGE"); const id = value(fd, "id");
  try { await archiveListeningLesson(actor.id, id); refresh(id); }
  catch (error) { redirect(`/admin/listening-lessons/${id}?error=${encodeURIComponent(error instanceof Error ? error.message : "ARCHIVE_FAILED")}`); }
  redirect(`/admin/listening-lessons/${id}?archived=1`);
}
