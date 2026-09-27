import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { saveDictionaryVocabulary } from "@/lib/vocabulary/service";

const schema = z.object({ word: z.string().min(1).max(48), context: z.string().max(500), part: z.number().int().min(1).max(7) });

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  let sameOrigin = false;
  try { sameOrigin = Boolean(origin && new URL(origin).host === request.headers.get("host")); } catch { /* Invalid origin. */ }
  if (!sameOrigin) return Response.json({ error: "forbidden" }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json") || Number(request.headers.get("content-length")) > 4096) return Response.json({ error: "invalid" }, { status: 400 });
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "sign_in" }, { status: 401 });
  const input = await request.json().catch(() => null);
  const parsed = schema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });
  const saved = await saveDictionaryVocabulary(user.id, parsed.data.word, parsed.data.context, parsed.data.part);
  if (!saved) return Response.json({ error: "not_found" }, { status: 404 });
  revalidatePath("/vocabulary");
  return Response.json({ saved: true });
}
