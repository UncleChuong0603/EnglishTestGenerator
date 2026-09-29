"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { activateTrial } from "@/lib/premium/trial";

export async function activateTrialAction() {
  const user = await requireUser();
  const result = await activateTrial(user.id);
  redirect(result.status === "STARTED" || result.status === "ALREADY_STARTED" ? "/billing?trial=started" : "/billing?trial=unavailable");
}
