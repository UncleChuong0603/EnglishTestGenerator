import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseConfig } from "./config";

/**
 * Creates a Supabase client for server components, route handlers, and server actions.
 * Cookie support is prepared now so a later authentication milestone can persist sessions.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseConfig();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
