"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { requireGuestOwnerHash } from "@/lib/guest/identity";
import { createGuestReadingPracticeSession, createReadingPracticeSession } from "@/lib/practice/selector";
import { UsageLimitError } from "@/lib/entitlements/service";
import { recordChallengeStart } from "@/lib/challenge/acquisition";

export async function startPart5Challenge() {
  const user = await getCurrentUser();
  try {
    if (!user) {
      const requestHeaders = await headers();
      const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? requestHeaders.get("x-real-ip") ?? "unknown";
      await enforceRateLimit("guest_practice", ip);
    }
    const guestReference = user ? null : await requireGuestOwnerHash();
    const sessionId = user
      ? await createReadingPracticeSession(user.id, { mode: "part_5", targetQuestionCount: 10, source: "custom" }, true)
      : await createGuestReadingPracticeSession(guestReference!, "part_5");
    await recordChallengeStart(user ? { userId: user.id } : { guestReference: guestReference! }, sessionId);
    redirect(`/challenge/part-5/${sessionId}`);
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) throw error;
    if (error instanceof UsageLimitError) redirect("/challenge/part-5?error=limit");
    console.error("Could not start Part 5 challenge", error);
    redirect("/challenge/part-5?error=unavailable");
  }
}
