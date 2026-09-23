"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { reviewVocabulary, saveVocabularyFromResult } from "@/lib/vocabulary/service";

const saveSchema = z.object({ sessionId: z.uuid(), questionId: z.uuid(), entryKey: z.string().min(1).max(80) });
const reviewSchema = z.object({ cardId: z.uuid(), remembered: z.enum(["yes", "no"]) });

export async function saveVocabularyAction(formData: FormData) {
  const user = await requireUser();
  const parsed = saveSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await saveVocabularyFromResult(user.id, parsed.data.sessionId, parsed.data.questionId, parsed.data.entryKey);
  revalidatePath("/vocabulary");
  revalidatePath(`/practice/${parsed.data.sessionId}/results`);
  revalidatePath(`/challenge/part-5/${parsed.data.sessionId}/result`);
}

export async function reviewVocabularyAction(formData: FormData) {
  const user = await requireUser();
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await reviewVocabulary(user.id, parsed.data.cardId, parsed.data.remembered === "yes");
  revalidatePath("/vocabulary");
}
