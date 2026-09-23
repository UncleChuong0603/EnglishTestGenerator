"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { guestContinuationPath } from "@/lib/auth/redirect";
import { migrateGuestAttempts } from "@/lib/guest/migration";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function retryGuestMigration(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const result = formData.get("result");
  if (typeof result !== "string" || !UUID.test(result)) redirect("/dashboard");
  let failed = false;
  try { await migrateGuestAttempts(user.id); }
  catch (error) {
    failed = true;
    console.error("[guest:migration] manual retry failed", { name: error instanceof Error ? error.name : "Unknown" });
  }
  redirect(`${guestContinuationPath(result)}${failed ? "&retry=failed" : ""}`);
}
