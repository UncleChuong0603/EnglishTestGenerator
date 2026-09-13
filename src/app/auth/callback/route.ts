import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { isInterfaceLanguage, LANGUAGE_COOKIE } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";

function redirectToSignIn(requestUrl: URL) {
  const signInUrl = new URL("/sign-in", requestUrl.origin);
  signInUrl.searchParams.set("error", "oauth_callback_failed");

  return NextResponse.redirect(signInUrl);
}

/**
 * Supabase redirects here after Google approves the sign-in request.
 * Exchanging the temporary code stores the resulting session in cookies.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return redirectToSignIn(requestUrl);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectToSignIn(requestUrl);
  }

  if (data.user) {
    const { data: profile } = await supabase.from("profiles").select("interface_language").eq("id", data.user.id).maybeSingle();
    if (isInterfaceLanguage(profile?.interface_language)) {
      (await cookies()).set(LANGUAGE_COOKIE, profile.interface_language, { maxAge: 31_536_000, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    }
  }

  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
