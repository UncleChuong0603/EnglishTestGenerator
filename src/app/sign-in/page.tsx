import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getCookieLanguage, getTranslations } from "@/lib/i18n/get-translations";

export default async function SignInPage() {
  const locale = await getCookieLanguage();
  const t = getTranslations(locale);
  return <Suspense fallback={<main aria-live="polite" className="grid min-h-[100svh] place-items-center bg-[#f6f8f8] text-sm font-semibold text-slate-600">{t.auth.loading}</main>}><SignInForm locale={locale} /></Suspense>;
}
