"use server";

import { z } from "zod";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getCurrentUser } from "@/lib/auth/session";

const feedbackSchema = z.object({
  email: z.string().trim().email().max(254),
  category: z.enum(["TECHNICAL", "CONTENT", "PAYMENT", "SUGGESTION", "OTHER"]),
  message: z.string().trim().min(20).max(4000),
  pageUrl: z.string().trim().max(500).url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol)).optional(),
  website: z.string().max(0),
});

export type FeedbackResult = { status: "success" | "invalid" | "rate" | "failed" };

export async function submitFeedback(formData: FormData): Promise<FeedbackResult> {
  const parsed = feedbackSchema.safeParse({
    email: formData.get("email"), category: formData.get("category"),
    message: formData.get("message"),
    pageUrl: formData.get("pageUrl") || undefined, website: formData.get("website") ?? "",
  });
  if (!parsed.success) return { status: "invalid" };
  try {
    const user = await getCurrentUser();
    await enforceRateLimit("support_feedback", user?.id ?? parsed.data.email);
    await db.insert(supportTickets).values({
      userId: user?.id, email: parsed.data.email.toLowerCase(), category: parsed.data.category,
      subject: parsed.data.message.replace(/\s+/g, " ").slice(0, 120), message: parsed.data.message, pageUrl: parsed.data.pageUrl || null,
    });
  } catch (error) {
    return { status: error instanceof Error && error.message === "RATE_LIMITED" ? "rate" : "failed" };
  }
  return { status: "success" };
}
