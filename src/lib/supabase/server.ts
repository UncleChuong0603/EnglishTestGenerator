import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseConfig } from "./config";

/**
 * Creates a Supabase client for server components, route handlers, and server actions.
 * The proxy refreshes sessions; server actions can write the updated cookies.
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
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot change cookies. The proxy handles refreshes there.
        }
      },
    },
  });
}
