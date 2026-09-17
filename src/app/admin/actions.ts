"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminActionError, grantPremiumAsAdmin, revokePremiumAsAdmin, setUserDisabled } from "@/lib/admin/service";

function destination(userId: string, error?: string) { return `/admin/users/${encodeURIComponent(userId)}${error ? `?error=${error}` : ""}`; }
async function actorId() { const user = await getCurrentUser(); return user?.id ?? ""; }
function safeCode(error: unknown) { return error instanceof AdminActionError ? error.code : "FAILED"; }

export async function grantPremiumAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? ""); const days = Number(formData.get("days"));
  try { await grantPremiumAsAdmin(await actorId(), userId, days); revalidatePath(`/admin/users/${userId}`); } catch (error) { redirect(destination(userId, safeCode(error))); }
  redirect(destination(userId));
}
export async function revokePremiumAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  try { await revokePremiumAsAdmin(await actorId(), userId); revalidatePath(`/admin/users/${userId}`); } catch (error) { redirect(destination(userId, safeCode(error))); }
  redirect(destination(userId));
}
export async function suspendUserAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  try { await setUserDisabled(await actorId(), userId, true); revalidatePath(`/admin/users/${userId}`); } catch (error) { redirect(destination(userId, safeCode(error))); }
  redirect(destination(userId));
}
export async function reactivateUserAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  try { await setUserDisabled(await actorId(), userId, false); revalidatePath(`/admin/users/${userId}`); } catch (error) { redirect(destination(userId, safeCode(error))); }
  redirect(destination(userId));
}
