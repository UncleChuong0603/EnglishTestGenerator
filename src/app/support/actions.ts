"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getCurrentUser } from "@/lib/auth/session";

const feedbackSchema = z.object({
  email: z.string().trim().email().max(254),
  category: z.enum(["TECHNICAL", "CONTENT", "PAYMENT", "SUGGESTION", "OTHER"]),
  subject: z.string().trim().min(4).max(120),
  message: z.string().trim().min(20).max(4000),
  pageUrl: z.string().trim().max(500).url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol)).optional(),
  website: z.string().max(0),
});

export async function submitFeedback(formData: FormData) {
  const user = await getCurrentUser();
  const parsed = feedbackSchema.safeParse({
    email: formData.get("email"), category: formData.get("category"),
    subject: formData.get("subject"), message: formData.get("message"),
    pageUrl: formData.get("pageUrl") || undefined, website: formData.get("website") ?? "",
  });
  if (!parsed.success) redirect("/support?error=invalid#feedback");
  try {
    await enforceRateLimit("support_feedback", user?.id ?? parsed.data.email);
    await db.insert(supportTickets).values({
      userId: user?.id, email: parsed.data.email.toLowerCase(), category: parsed.data.category,
      subject: parsed.data.subject, message: parsed.data.message, pageUrl: parsed.data.pageUrl || null,
    });
  } catch (error) {
    redirect(`/support?error=${error instanceof Error && error.message === "RATE_LIMITED" ? "rate" : "failed"}#feedback`);
  }
  redirect("/support?sent=1#feedback");
}
