import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function redirectToSignIn(requestUrl: URL) {
  const signInUrl = new URL("/sign-in", requestUrl.origin);
  signInUrl.searchParams.set("error", "oauth_callback_failed");

  return NextResponse.redirect(signInUrl);
}

/**
 * Supabase redirects here after Google approves the sign-in request.
 * Exchanging the temporary code stores the resulting session in cookies.
/**
 * Supabase redirects here after a user confirms an email address.
 * Exchanging the code stores the session in the user's cookies.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return redirectToSignIn(requestUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectToSignIn(requestUrl);
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
