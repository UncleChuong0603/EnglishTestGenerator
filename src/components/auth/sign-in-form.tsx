"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n/runtime";
import { createClient } from "@/lib/supabase/client";

export function SignInForm({ locale }: { locale: InterfaceLanguage }) {
  const t = getTranslations(locale);
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const callbackFailed = searchParams.get("error") === "oauth_callback_failed";
  async function signInWithGoogle() {
    setErrorMessage(""); setIsSubmitting(true);
    const { data, error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback`, skipBrowserRedirect: true } });
    if (error || !data.url) { if (error) console.error("Google sign-in could not be started", error); setErrorMessage(t.auth.startError); setIsSubmitting(false); return; }
    window.location.assign(data.url);
  }
  return <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 sm:px-10"><section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8"><Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" href="/">← {t.common.backHome}</Link><h1 className="mt-6 text-3xl font-bold tracking-tight">{t.auth.signIn}</h1><p className="mt-2 text-slate-600">{t.auth.intro}</p>{callbackFailed ? <p aria-live="polite" className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{t.auth.callbackError}</p> : null}{errorMessage ? <p aria-live="polite" className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p> : null}<button className="mt-8 flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} onClick={signInWithGoogle} type="button">{isSubmitting ? t.auth.connecting : t.auth.continueGoogle}</button></section></main>;
}
