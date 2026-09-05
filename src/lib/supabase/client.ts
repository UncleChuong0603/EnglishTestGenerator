import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "./config";

/**
 * Creates a Supabase client for browser-only code.
 * Use this later in interactive React components, not in server code.
 */
export function createClient() {
  const { url, publishableKey } = getSupabaseConfig();

  return createBrowserClient(url, publishableKey);
}
