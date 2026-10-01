"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AccountDataError, deleteAccount } from "@/lib/account-data/service";
import { getCurrentUser, SESSION_COOKIE } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/auth/rate-limit";

export type DeleteAccountActionState = {
  ok: false;
  error?: "invalid" | "confirmation_mismatch" | "admin_handoff_required" | "private_data_handoff_required" | "rate_limited" | "delete_failed";
};

const schema = z.object({
  confirmationEmail: z.email().max(320),
  acknowledge: z.literal("yes"),
});

export async function deleteAccountAction(
  _state: DeleteAccountActionState,
  formData: FormData,
): Promise<DeleteAccountActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "invalid" };

  try {
    await enforceRateLimit("account_delete", user.id);
    await deleteAccount(user.id, parsed.data.confirmationEmail);
    (await cookies()).delete(SESSION_COOKIE);
    redirect("/account-deleted");
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) throw error;
    if (error instanceof Error && error.message === "RATE_LIMITED") return { ok: false, error: "rate_limited" };
    if (error instanceof AccountDataError) {
      if (error.code === "CONFIRMATION_MISMATCH") return { ok: false, error: "confirmation_mismatch" };
      if (error.code === "ADMIN_HANDOFF_REQUIRED") return { ok: false, error: "admin_handoff_required" };
      if (error.code === "PRIVATE_DATA_HANDOFF_REQUIRED") return { ok: false, error: "private_data_handoff_required" };
    }
    console.error("[account:delete]", error);
    return { ok: false, error: "delete_failed" };
  }
}
