"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createMasteryReviewSession } from "@/lib/practice/selector";
import { UsageLimitError } from "@/lib/entitlements/service";

export async function startMasteryReview(formData: FormData) {
  const user = await requireUser();
  const value = Number(formData.get("part"));
  const part = [1, 2, 3, 4, 5, 6, 7].includes(value) ? value : undefined;
  try { redirect(`/practice/${await createMasteryReviewSession(user.id, part)}`); }
  catch (error) { if (typeof error === "object" && error && "digest" in error) throw error; if (error instanceof UsageLimitError) redirect(`/mistakes?error=usage_limit&resetAt=${encodeURIComponent(error.status.resetAt)}`); console.error("Could not start mastery review", error); redirect("/mistakes?error=unavailable"); }
}
