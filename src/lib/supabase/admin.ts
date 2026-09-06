import "server-only";

import { createClient } from "@supabase/supabase-js";

/** Creates a trusted server-only client for question-bank selection and deterministic scoring writes. */
/** Creates a trusted server-only client for generation and deterministic scoring writes. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Missing server-side Supabase configuration.");
  }

  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
