import "server-only";
import { getCurrentUser } from "@/lib/auth/session";
import { getGuestOwnerHash } from "@/lib/guest/identity";

export async function resolveProductActor() {
  const user = await getCurrentUser();
  if (user) return { userId: user.id } as const;
  const guestReference = await getGuestOwnerHash();
  return guestReference ? { guestReference } as const : {};
}
